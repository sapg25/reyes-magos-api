/**
 * Middleware de seguridad.
 *   Sin token o token inválido → 401
 *   Token válido pero con otro rol → 403
 */
const ApiError = require('../errors/ApiError');
const authService = require('../services/auth.service');

function requiereRol(...rolesPermitidos) {
  return (req, _res, next) => {
    const header = req.headers.authorization || '';
    const [tipo, token] = header.split(' ');
    if (tipo !== 'Bearer' || !token) {
      return next(ApiError.unauthorized());
    }
    const payload = authService.verificarToken(token); // lanza 401 si es inválido
    if (!rolesPermitidos.includes(payload.rol)) {
      return next(
        ApiError.forbidden(`El rol ${payload.rol} no puede realizar esta acción; se requiere ${rolesPermitidos.join(' o ')}`)
      );
    }
    req.usuario = payload;
    next();
  };
}

module.exports = { requiereRol };
