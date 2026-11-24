// Enumeraciones y reglas fijas del dominio (Escenario D)

const REYES = ['MELCHOR', 'GASPAR', 'BALTASAR'];
const OFRENDAS = ['ORO', 'INCIENSO', 'MIRRA'];

const ESTADOS_CARAVANA = ['DETENIDA', 'EN_CAMINO', 'EN_BELEN', 'OFRENDA_ENTREGADA'];
const ESTADOS_PARADA = ['PLANIFICADA', 'CUMPLIDA', 'CANCELADA'];

// Regla 1: transiciones válidas de la caravana
const TRANSICIONES_CARAVANA = {
  DETENIDA: ['EN_CAMINO'],
  EN_CAMINO: ['DETENIDA', 'EN_BELEN'],
  EN_BELEN: ['OFRENDA_ENTREGADA'],
  OFRENDA_ENTREGADA: [],
};

// Una parada planificada solo puede cumplirse o cancelarse
const TRANSICIONES_PARADA = {
  PLANIFICADA: ['CUMPLIDA', 'CANCELADA'],
  CUMPLIDA: [],
  CANCELADA: [],
};

const ROLES = {
  JEFE_CARAVANA: 'JEFE_CARAVANA',
  PAJE: 'PAJE',
};

module.exports = {
  REYES,
  OFRENDAS,
  ESTADOS_CARAVANA,
  ESTADOS_PARADA,
  TRANSICIONES_CARAVANA,
  TRANSICIONES_PARADA,
  ROLES,
};
