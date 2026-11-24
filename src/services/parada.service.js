/**
 * Capa de servicios: reglas de negocio de las paradas del itinerario.
 */
const paradaRepo = require('../repositories/parada.repository');
const caravanaService = require('./caravana.service');
const ApiError = require('../errors/ApiError');
const { TRANSICIONES_PARADA } = require('../config/dominio');

function obtenerOFallar(id) {
  const parada = paradaRepo.buscarPorId(id);
  if (!parada) throw ApiError.notFound(`No existe la parada con id ${id}`);
  return parada;
}

function listarPorCaravana(caravanaId) {
  caravanaService.obtenerOFallar(caravanaId); // 404 si la caravana no existe
  return paradaRepo.listarPorCaravana(caravanaId);
}

function agregar(caravanaId, datos) {
  const caravana = caravanaService.obtenerOFallar(caravanaId); // 404

  // Regla 5: no se agregan paradas a una caravana que ya llegó
  if (['EN_BELEN', 'OFRENDA_ENTREGADA'].includes(caravana.estado)) {
    throw ApiError.conflict(
      'CARAVANA_FINALIZADA',
      `No se pueden agregar paradas a una caravana en estado ${caravana.estado}`
    );
  }

  // "orden" es único dentro de la misma caravana
  if (paradaRepo.buscarPorCaravanaYOrden(caravanaId, datos.orden)) {
    throw ApiError.conflict(
      'ORDEN_DUPLICADO',
      `La caravana ${caravanaId} ya tiene una parada con orden ${datos.orden}`
    );
  }

  return paradaRepo.crear({ caravanaId, ...datos, estado: 'PLANIFICADA' });
}

function cambiarEstado(id, nuevoEstado) {
  const parada = obtenerOFallar(id);

  if (!TRANSICIONES_PARADA[parada.estado].includes(nuevoEstado)) {
    throw ApiError.conflict(
      'TRANSICION_INVALIDA',
      `No se puede pasar de ${parada.estado} a ${nuevoEstado}`
    );
  }

  // Regla 4: las paradas se cumplen en orden
  if (nuevoEstado === 'CUMPLIDA') {
    const anterior = paradaRepo
      .listarPorCaravana(parada.caravanaId)
      .filter((p) => p.orden < parada.orden)
      .pop(); // la inmediatamente anterior (n − 1)
    if (anterior && anterior.estado === 'PLANIFICADA') {
      throw ApiError.conflict(
        'PARADA_ANTERIOR_PENDIENTE',
        `No se puede cumplir la parada ${parada.orden} (${parada.ciudad}) mientras la parada ${anterior.orden} (${anterior.ciudad}) siga PLANIFICADA`
      );
    }
  }

  return paradaRepo.actualizar(id, { estado: nuevoEstado });
}

function eliminar(id) {
  const parada = obtenerOFallar(id);
  if (parada.estado !== 'PLANIFICADA') {
    throw ApiError.conflict(
      'PARADA_NO_ELIMINABLE',
      `Solo se puede eliminar una parada PLANIFICADA; esta está ${parada.estado}`
    );
  }
  paradaRepo.eliminar(id);
}

module.exports = { listarPorCaravana, agregar, cambiarEstado, eliminar };
