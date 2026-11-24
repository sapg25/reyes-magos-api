/**
 * Mock local de EstrellaDeBelenService (SOAP) para pruebas.
 * El docente entrega su propio mock; basta con cambiar ESTRELLA_SOAP_URL en .env.
 *
 *   origen "Herodes" → soap:Fault "Cielo cubierto"   (API responde 503)
 *   origen "Nubes"   → visibilidad NUBLADA            (API responde 422)
 *   origen "Lento"   → no responde en 3 s (timeout)    (API responde 503)
 *   cualquier otro   → visibilidad VISIBLE, 3 días
 */
require('dotenv').config({ quiet: true });
const http = require('http');

const PUERTO = Number(process.env.MOCK_PORT || 8088);

function leerEtiqueta(xml, etiqueta) {
  const m = xml.match(new RegExp(`<(?:\\w+:)?${etiqueta}>([^<]*)</(?:\\w+:)?${etiqueta}>`));
  return m ? m[1].trim() : '';
}

const fault = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Body>
    <soapenv:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>Cielo cubierto</faultstring>
    </soapenv:Fault>
  </soapenv:Body>
</soapenv:Envelope>`;

const exito = (visibilidad, dias) => `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:eb="http://belen.beatlech/estrella">
  <soapenv:Body>
    <eb:ConsultarRutaResponse>
      <eb:visibilidad>${visibilidad}</eb:visibilidad>
      <eb:diasRestantes>${dias}</eb:diasRestantes>
    </eb:ConsultarRutaResponse>
  </soapenv:Body>
</soapenv:Envelope>`;

http
  .createServer((req, res) => {
    let cuerpo = '';
    req.on('data', (c) => (cuerpo += c));
    req.on('end', () => {
      const origen = leerEtiqueta(cuerpo, 'origen');
      console.log(`[mock SOAP] ConsultarRuta origen="${origen}"`);
      const responder = (status, xml) => {
        res.writeHead(status, { 'Content-Type': 'text/xml; charset=utf-8' });
        res.end(xml);
      };
      if (origen === 'Herodes') return responder(500, fault);
      if (origen === 'Nubes') return responder(200, exito('NUBLADA', 5));
      if (origen === 'Lento') return setTimeout(() => responder(200, exito('VISIBLE', 3)), 5000);
      return responder(200, exito('VISIBLE', 3));
    });
  })
  .listen(PUERTO, () => console.log(`Mock SOAP EstrellaDeBelenService en http://localhost:${PUERTO}/estrella`));
