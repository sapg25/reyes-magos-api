/**
 * Validación de formato de entrada (400). Las reglas de negocio NO van aquí,
 * van en la capa de servicios.
 */
const ApiError = require('../errors/ApiError');
const { REYES, OFRENDAS, ESTADOS_CARAVANA, ESTADOS_PARADA } = require('../config/dominio');

function esTextoNoVacio(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function esEnteroEnRango(v, min, max = Infinity) {
  return Number.isInteger(v) && v >= min && v <= max;
}

function lanzarSiHayErrores(detalles) {
  if (detalles.length > 0) {
    throw ApiError.badRequest('La solicitud tiene datos inválidos', detalles);
  }
}

function exigirObjeto(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw ApiError.badRequest('El cuerpo de la solicitud debe ser un objeto JSON');
  }
}

function validarCaravana(body) {
  exigirObjeto(body);
  const detalles = [];
  if (!REYES.includes(body.rey)) {
    detalles.push({ campo: 'rey', mensaje: `Debe ser uno de: ${REYES.join(', ')}` });
  }
  if (!OFRENDAS.includes(body.ofrenda)) {
    detalles.push({ campo: 'ofrenda', mensaje: `Debe ser uno de: ${OFRENDAS.join(', ')}` });
  }
  if (!esTextoNoVacio(body.origen)) {
    detalles.push({ campo: 'origen', mensaje: 'Es obligatorio' });
  }
  if (!esEnteroEnRango(body.camellos, 1, 12)) {
    detalles.push({ campo: 'camellos', mensaje: 'Debe ser un entero entre 1 y 12' });
  }
  lanzarSiHayErrores(detalles);
  return {
    rey: body.rey,
    ofrenda: body.ofrenda,
    origen: body.origen.trim(),
    camellos: body.camellos,
  };
}

function validarParada(body) {
  exigirObjeto(body);
  const detalles = [];
  if (!esTextoNoVacio(body.ciudad)) {
    detalles.push({ campo: 'ciudad', mensaje: 'Es obligatoria' });
  }
  if (!esEnteroEnRango(body.orden, 1)) {
    detalles.push({ campo: 'orden', mensaje: 'Debe ser un entero mayor o igual a 1' });
  }
  if (!esEnteroEnRango(body.diasEstancia, 0, 7)) {
    detalles.push({ campo: 'diasEstancia', mensaje: 'Debe ser un entero entre 0 y 7' });
  }
  lanzarSiHayErrores(detalles);
  return { ciudad: body.ciudad.trim(), orden: body.orden, diasEstancia: body.diasEstancia };
}

function validarCambioEstado(body, permitidos) {
  exigirObjeto(body);
  if (!permitidos.includes(body.estado)) {
    throw ApiError.badRequest('Estado inválido', [
      { campo: 'estado', mensaje: `Debe ser uno de: ${permitidos.join(', ')}` },
    ]);
  }
  return body.estado;
}

function validarEstadoCaravana(body) {
  return validarCambioEstado(body, ESTADOS_CARAVANA);
}

function validarEstadoParada(body) {
  // Por esta ruta solo se puede marcar cumplida o cancelada
  return validarCambioEstado(body, ESTADOS_PARADA.filter((e) => e !== 'PLANIFICADA'));
}

function validarFiltroEstado(estado) {
  if (estado === undefined) return undefined;
  if (!ESTADOS_CARAVANA.includes(estado)) {
    throw ApiError.badRequest('Filtro inválido', [
      { campo: 'estado', mensaje: `Debe ser uno de: ${ESTADOS_CARAVANA.join(', ')}` },
    ]);
  }
  return estado;
}

function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id < 1) {
    throw ApiError.badRequest('El id debe ser un entero positivo', [{ campo: 'id', mensaje: `Valor recibido: ${valor}` }], 'ID_INVALIDO');
  }
  return id;
}

module.exports = {
  validarCaravana,
  validarParada,
  validarEstadoCaravana,
  validarEstadoParada,
  validarFiltroEstado,
  validarId,
};
