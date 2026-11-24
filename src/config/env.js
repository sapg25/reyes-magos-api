require('dotenv').config({ quiet: true });

function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Copia .env.example a .env`);
  }
  return valor;
}

module.exports = {
  port: Number(process.env.PORT || 3000),
  jwt: {
    secret: requerida('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  estrella: {
    url: requerida('ESTRELLA_SOAP_URL'),
    soapAction: process.env.ESTRELLA_SOAP_ACTION || 'ConsultarRuta',
    timeoutMs: Number(process.env.ESTRELLA_TIMEOUT_MS || 3000),
    intentos: Math.min(Number(process.env.ESTRELLA_INTENTOS || 2), 2),
    backoffMs: Number(process.env.ESTRELLA_BACKOFF_MS || 300),
  },
};
