/**
 * Adaptador del servicio SOAP heredado EstrellaDeBelenService.
 *
 * Responsabilidad: traducir objeto de dominio <-> XML.
 *   entrada: { origen, destino }
 *   salida:  { visibilidad: 'VISIBLE' | 'NUBLADA', diasRestantes: number }
 *
 * Si el servicio responde soap:Fault, no responde en ESTRELLA_TIMEOUT_MS (3 s)
 * o la red falla, reintenta con backoff (máx. 2 intentos en total) y luego lanza
 * ServicioExternoError. El resto del sistema nunca ve XML.
 */
const { XMLParser } = require('fast-xml-parser');
const config = require('../config/env');
const ServicioExternoError = require('../errors/ServicioExternoError');

const parser = new XMLParser({ removeNSPrefix: true, ignoreAttributes: true, parseTagValue: false });

function escaparXml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function construirSobre({ origen, destino }) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:eb="http://belen.beatlech/estrella">
  <soapenv:Body>
    <eb:ConsultarRutaRequest>
      <eb:origen>${escaparXml(origen)}</eb:origen>
      <eb:destino>${escaparXml(destino)}</eb:destino>
    </eb:ConsultarRutaRequest>
  </soapenv:Body>
</soapenv:Envelope>`;
}

// Busca una etiqueta dentro del objeto parseado, sin importar el nombre del nodo padre
function buscar(nodo, etiqueta) {
  if (!nodo || typeof nodo !== 'object') return undefined;
  if (etiqueta in nodo) return nodo[etiqueta];
  for (const hijo of Object.values(nodo)) {
    const encontrado = buscar(hijo, etiqueta);
    if (encontrado !== undefined) return encontrado;
  }
  return undefined;
}

function interpretarRespuesta(xml) {
  let doc;
  try {
    doc = parser.parse(xml);
  } catch {
    throw new ServicioExternoError('RESPUESTA_INVALIDA', 'La respuesta del servicio no es XML válido');
  }
  const body = buscar(doc, 'Body');
  if (!body) {
    throw new ServicioExternoError('RESPUESTA_INVALIDA', 'La respuesta no contiene un soap:Body');
  }

  const fault = buscar(body, 'Fault');
  if (fault) {
    const faultstring = buscar(fault, 'faultstring') || 'Fault sin descripción';
    throw new ServicioExternoError('FAULT', `EstrellaDeBelenService: ${faultstring}`);
  }

  const visibilidad = String(buscar(body, 'visibilidad') ?? '').trim();
  if (!['VISIBLE', 'NUBLADA'].includes(visibilidad)) {
    throw new ServicioExternoError('RESPUESTA_INVALIDA', `Visibilidad desconocida: "${visibilidad}"`);
  }
  const diasRestantes = Number(buscar(body, 'diasRestantes'));
  return { visibilidad, diasRestantes: Number.isFinite(diasRestantes) ? diasRestantes : null };
}

async function llamarUnaVez(sobre) {
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), config.estrella.timeoutMs);
  try {
    const respuesta = await fetch(config.estrella.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: config.estrella.soapAction,
      },
      body: sobre,
      signal: controlador.signal,
    });
    // Un Fault suele venir con HTTP 500: igual se interpreta el XML
    const texto = await respuesta.text();
    return interpretarRespuesta(texto);
  } catch (error) {
    if (error instanceof ServicioExternoError) throw error;
    if (error.name === 'AbortError') {
      throw new ServicioExternoError(
        'TIMEOUT',
        `EstrellaDeBelenService no respondió en ${config.estrella.timeoutMs / 1000} segundos`
      );
    }
    throw new ServicioExternoError('RED', `No se pudo conectar con EstrellaDeBelenService: ${error.message}`);
  } finally {
    clearTimeout(temporizador);
  }
}

const esperar = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

/**
 * Operación ConsultarRuta.
 * @returns {Promise<{visibilidad: string, diasRestantes: number|null}>}
 */
async function consultarRuta(origen, destino = 'Belen') {
  const sobre = construirSobre({ origen, destino });
  const intentos = config.estrella.intentos;
  let ultimoError;

  for (let intento = 1; intento <= intentos; intento++) {
    try {
      return await llamarUnaVez(sobre);
    } catch (error) {
      ultimoError = error;
      console.warn(`[EstrellaAdapter] intento ${intento}/${intentos} falló: ${error.message}`);
      if (intento < intentos) {
        await esperar(config.estrella.backoffMs * 2 ** (intento - 1)); // backoff exponencial
      }
    }
  }
  throw ultimoError;
}

module.exports = { consultarRuta, construirSobre, interpretarRespuesta };
