/**
 * Manejador global de errores: TODA respuesta de error sale con el mismo formato.
 * { codigo, mensaje, detalles, timestamp, ruta }
 */
const ApiError = require('../errors/ApiError');

function formato(req, status, codigo, mensaje, detalles = []) {
  return {
    status,
    cuerpo: {
      codigo,
      mensaje,
      detalles,
      timestamp: new Date().toISOString(),
      ruta: req.originalUrl,
    },
  };
}

function rutaNoEncontrada(req, _res, next) {
  next(ApiError.notFound(`La ruta ${req.method} ${req.originalUrl} no existe`));
}

// eslint-disable-next-line no-unused-vars
function manejadorErrores(err, req, res, _next) {
  let respuesta;

  if (err instanceof ApiError) {
    respuesta = formato(req, err.status, err.codigo, err.message, err.detalles);
  } else if (err.type === 'entity.parse.failed') {
    // JSON mal formado en el body
    respuesta = formato(req, 400, 'JSON_INVALIDO', 'El cuerpo de la solicitud no es un JSON válido');
  } else {
    // Cualquier error inesperado: se registra y se responde sin exponer detalles internos
    console.error('[ERROR NO CONTROLADO]', err);
    respuesta = formato(req, 500, 'ERROR_INTERNO', 'Ocurrió un error inesperado');
  }

  res.status(respuesta.status).json(respuesta.cuerpo);
}

module.exports = { manejadorErrores, rutaNoEncontrada };
