/**
 * Capa de rutas: define método + URL + seguridad y delega al controlador.
 */
const { Router } = require('express');
const caravanas = require('../controllers/caravana.controller');
const paradas = require('../controllers/parada.controller');
const auth = require('../controllers/auth.controller');
const { requiereRol } = require('../middlewares/auth');
const { ROLES } = require('../config/dominio');

const router = Router();
const jefe = requiereRol(ROLES.JEFE_CARAVANA);

// Autenticación (obtener token de prueba)
router.post('/auth/login', auth.login);

// Caravanas
router.post('/caravanas', jefe, caravanas.crear);
router.get('/caravanas', caravanas.listar);
router.get('/caravanas/:id', caravanas.detalle);
router.put('/caravanas/:id', jefe, caravanas.actualizar);
router.patch('/caravanas/:id/estado', jefe, caravanas.cambiarEstado);

// Paradas de una caravana
router.post('/caravanas/:id/paradas', jefe, caravanas.agregarParada);
router.get('/caravanas/:id/paradas', caravanas.listarParadas);

// Extra D
router.get('/caravanas/:id/itinerario', caravanas.itinerario);

// Paradas
router.patch('/paradas/:id/estado', paradas.cambiarEstado);
router.delete('/paradas/:id', jefe, paradas.eliminar);

module.exports = router;
