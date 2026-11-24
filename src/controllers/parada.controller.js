const paradaService = require('../services/parada.service');
const v = require('../validators/validadores');

module.exports = {
  cambiarEstado(req, res) {
    const id = v.validarId(req.params.id);
    const estado = v.validarEstadoParada(req.body);
    res.json(paradaService.cambiarEstado(id, estado));
  },

  eliminar(req, res) {
    paradaService.eliminar(v.validarId(req.params.id));
    res.status(204).send();
  },
};
