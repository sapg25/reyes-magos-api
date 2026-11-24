/**
 * Controladores delgados: leen la petición, validan formato,
 * llaman al servicio y devuelven el código HTTP. Sin reglas de negocio.
 */
const caravanaService = require('../services/caravana.service');
const paradaService = require('../services/parada.service');
const v = require('../validators/validadores');

module.exports = {
  listar(req, res) {
    const estado = v.validarFiltroEstado(req.query.estado);
    res.json(caravanaService.listar({ estado }));
  },

  detalle(req, res) {
    res.json(caravanaService.obtenerConParadas(v.validarId(req.params.id)));
  },

  crear(req, res) {
    const datos = v.validarCaravana(req.body);
    const caravana = caravanaService.crear(datos);
    res.status(201).location(`/api/caravanas/${caravana.id}`).json(caravana);
  },

  actualizar(req, res) {
    const id = v.validarId(req.params.id);
    const datos = v.validarCaravana(req.body);
    res.json(caravanaService.actualizar(id, datos));
  },

  async cambiarEstado(req, res) {
    const id = v.validarId(req.params.id);
    const estado = v.validarEstadoCaravana(req.body);
    res.json(await caravanaService.cambiarEstado(id, estado));
  },

  listarParadas(req, res) {
    res.json(paradaService.listarPorCaravana(v.validarId(req.params.id)));
  },

  agregarParada(req, res) {
    const caravanaId = v.validarId(req.params.id);
    const datos = v.validarParada(req.body);
    const parada = paradaService.agregar(caravanaId, datos);
    res.status(201).location(`/api/paradas/${parada.id}`).json(parada);
  },

  itinerario(req, res) {
    res.json(caravanaService.itinerario(v.validarId(req.params.id)));
  },
};
