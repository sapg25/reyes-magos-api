/**
 * Lo lanza el adaptador SOAP cuando el servicio externo responde con
 * un soap:Fault o no responde dentro del timeout. No sabe nada de HTTP:
 * es la capa de servicios la que decide qué hacer (en el escenario D: 503).
 */
class ServicioExternoError extends Error {
  constructor(motivo, mensaje) {
    super(mensaje);
    this.motivo = motivo; // 'FAULT' | 'TIMEOUT' | 'RED' | 'RESPUESTA_INVALIDA'
  }
}

module.exports = ServicioExternoError;
