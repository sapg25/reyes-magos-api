const authService = require('../services/auth.service');
const ApiError = require('../errors/ApiError');

module.exports = {
  login(req, res) {
    const { usuario, clave } = req.body || {};
    if (typeof usuario !== 'string' || typeof clave !== 'string') {
      throw ApiError.badRequest('Debe enviar usuario y clave', [
        { campo: 'usuario', mensaje: 'Obligatorio' },
        { campo: 'clave', mensaje: 'Obligatoria' },
      ]);
    }
    res.json(authService.login(usuario, clave));
  },
};
