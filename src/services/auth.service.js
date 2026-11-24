/**
 * Emisión y verificación de JWT. La clave viene de JWT_SECRET (.env).
 * Usuarios de prueba (no son secretos: están documentados en el README).
 */
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const ApiError = require('../errors/ApiError');

const USUARIOS_PRUEBA = [
  { usuario: 'jefe', clave: 'jefe123', rol: 'JEFE_CARAVANA' },
  { usuario: 'paje', clave: 'paje123', rol: 'PAJE' },
];

function emitirToken({ usuario, rol }) {
  return jwt.sign({ sub: usuario, rol }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
}

function login(usuario, clave) {
  const encontrado = USUARIOS_PRUEBA.find((u) => u.usuario === usuario && u.clave === clave);
  if (!encontrado) throw ApiError.unauthorized('Usuario o clave incorrectos');
  return { token: emitirToken(encontrado), rol: encontrado.rol, tipo: 'Bearer' };
}

function verificarToken(token) {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch {
    throw ApiError.unauthorized('Token inválido o expirado');
  }
}

module.exports = { login, verificarToken, emitirToken, USUARIOS_PRUEBA };
