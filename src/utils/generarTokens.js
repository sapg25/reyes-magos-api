// Imprime tokens de prueba para Postman:  npm run token
const { emitirToken, USUARIOS_PRUEBA } = require('../services/auth.service');

for (const u of USUARIOS_PRUEBA) {
  console.log(`${u.rol.padEnd(14)} Bearer ${emitirToken(u)}`);
}
