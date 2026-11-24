const config = require('./config/env');
const app = require('./app');

app.listen(config.port, () => {
  console.log(`API Reyes Magos escuchando en http://localhost:${config.port}`);
  console.log(`Servicio SOAP Estrella: ${config.estrella.url}`);
});
