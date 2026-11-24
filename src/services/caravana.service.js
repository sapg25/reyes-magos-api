/**
 * Capa de servicios: aquí viven TODAS las reglas de negocio de la caravana.
 * Los controladores solo llaman a estas funciones.
 */
const caravanaRepo = require('../repositories/caravana.repository');
const paradaRepo = require('../repositories/parada.repository');
const estrellaAdapter = require('../adapters/EstrellaAdapter');
const ServicioExternoError = require('../errors/ServicioExternoError');
const ApiError = require('../errors/ApiError');
const { TRANSICIONES_CARAVANA } = require('../config/dominio');

function obtenerOFallar(id) {
  const caravana = caravanaRepo.buscarPorId(id);
  if (!caravana) throw ApiError.notFound(`No existe la caravana con id ${id}`);
  return caravana;
}

// rey y ofrenda son únicos entre caravanas
function verificarUnicidad({ rey, ofrenda }, idActual = null) {
  const conMismoRey = caravanaRepo.buscarPorRey(rey);
  if (conMismoRey && conMismoRey.id !== idActual) {
    throw ApiError.conflict('REY_DUPLICADO', `El rey ${rey} ya tiene una caravana (id ${conMismoRey.id})`);
  }
  const conMismaOfrenda = caravanaRepo.buscarPorOfrenda(ofrenda);
  if (conMismaOfrenda && conMismaOfrenda.id !== idActual) {
    throw ApiError.conflict(
      'OFRENDA_DUPLICADA',
      `La ofrenda ${ofrenda} ya la lleva otra caravana (id ${conMismaOfrenda.id})`
    );
  }
}

function listar(filtros) {
  return caravanaRepo.listar(filtros);
}

function obtenerConParadas(id) {
  const caravana = obtenerOFallar(id);
  return { ...caravana, paradas: paradaRepo.listarPorCaravana(id) };
}

function crear(datos) {
  verificarUnicidad(datos);
  // Regla 1: una caravana nueva siempre nace DETENIDA (se ignora cualquier estado enviado)
  return caravanaRepo.crear({ ...datos, estado: 'DETENIDA' });
}

function actualizar(id, datos) {
  const caravana = obtenerOFallar(id);
  if (caravana.estado !== 'DETENIDA') {
    throw ApiError.conflict(
      'CARAVANA_NO_EDITABLE',
      `Solo se puede editar una caravana DETENIDA; esta está ${caravana.estado}`
    );
  }
  verificarUnicidad(datos, id);
  return caravanaRepo.actualizar(id, datos);
}

async function cambiarEstado(id, nuevoEstado) {
  const caravana = obtenerOFallar(id);

  // Regla 1: transiciones válidas
  const permitidos = TRANSICIONES_CARAVANA[caravana.estado];
  if (!permitidos.includes(nuevoEstado)) {
    throw ApiError.conflict(
      'TRANSICION_INVALIDA',
      `No se puede pasar de ${caravana.estado} a ${nuevoEstado}`
    );
  }

  const extra = {};

  // Regla 2: para ponerse EN_CAMINO se consulta la estrella (SOAP)
  if (nuevoEstado === 'EN_CAMINO') {
    let ruta;
    try {
      ruta = await estrellaAdapter.consultarRuta(caravana.origen, 'Belen');
    } catch (error) {
      if (error instanceof ServicioExternoError) {
        // Manejo del fallo distribuido: la caravana permanece DETENIDA → 503
        throw ApiError.serviceUnavailable(
          `No se pudo consultar la Estrella de Belén (${error.message}). La caravana permanece DETENIDA; intente más tarde.`
        );
      }
      throw error;
    }
    if (ruta.visibilidad === 'NUBLADA') {
      throw ApiError.unprocessable(
        'ESTRELLA_NUBLADA',
        'La estrella está NUBLADA: la caravana no puede avanzar'
      );
    }
    extra.diasRestantes = ruta.diasRestantes;
  }

  // Regla 3: para llegar a EN_BELEN ninguna parada puede seguir PLANIFICADA
  if (nuevoEstado === 'EN_BELEN') {
    const pendientes = paradaRepo
      .listarPorCaravana(id)
      .filter((p) => p.estado === 'PLANIFICADA');
    if (pendientes.length > 0) {
      const ciudades = pendientes.map((p) => `${p.orden}. ${p.ciudad}`).join(', ');
      throw ApiError.unprocessable(
        'PARADAS_PENDIENTES',
        `No se puede llegar a Belén con paradas PLANIFICADAS: ${ciudades}`
      );
    }
  }

  return caravanaRepo.actualizar(id, { estado: nuevoEstado, ...extra });
}

// Extra D: itinerario resumido
function itinerario(id) {
  const caravana = obtenerOFallar(id);
  const paradas = paradaRepo.listarPorCaravana(id);
  const activas = paradas.filter((p) => p.estado !== 'CANCELADA');
  return {
    caravanaId: caravana.id,
    rey: caravana.rey,
    estado: caravana.estado,
    paradas,
    diasTotalesViaje: activas.reduce((suma, p) => suma + p.diasEstancia, 0),
    paradasFaltantes: paradas.filter((p) => p.estado === 'PLANIFICADA').length,
  };
}

module.exports = { listar, obtenerConParadas, crear, actualizar, cambiarEstado, itinerario, obtenerOFallar };
