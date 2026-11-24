/**
 * Error de dominio con código HTTP y código de negocio.
 * El manejador global (middlewares/errorHandler.js) lo convierte
 * al formato estándar { codigo, mensaje, detalles, timestamp, ruta }.
 */
class ApiError extends Error {
  constructor(status, codigo, mensaje, detalles = []) {
    super(mensaje);
    this.status = status;
    this.codigo = codigo;
    this.detalles = detalles;
  }

  static badRequest(mensaje, detalles = [], codigo = 'VALIDACION_FALLIDA') {
    return new ApiError(400, codigo, mensaje, detalles);
  }
  static unauthorized(mensaje = 'Se requiere un token válido en el header Authorization') {
    return new ApiError(401, 'NO_AUTENTICADO', mensaje);
  }
  static forbidden(mensaje) {
    return new ApiError(403, 'ROL_INSUFICIENTE', mensaje);
  }
  static notFound(mensaje) {
    return new ApiError(404, 'RECURSO_NO_ENCONTRADO', mensaje);
  }
  static conflict(codigo, mensaje) {
    return new ApiError(409, codigo, mensaje);
  }
  static unprocessable(codigo, mensaje) {
    return new ApiError(422, codigo, mensaje);
  }
  static serviceUnavailable(mensaje) {
    return new ApiError(503, 'SERVICIO_EXTERNO_NO_DISPONIBLE', mensaje);
  }
}

module.exports = ApiError;
