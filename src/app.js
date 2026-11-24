const express = require('express');
const rutas = require('./routes');
const { manejadorErrores, rutaNoEncontrada } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ api: 'Logística de los Reyes Magos', escenario: 'D', docs: '/api' });
});

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
