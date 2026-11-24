/**
 * Capa de datos: guarda las caravanas en memoria.
 * Solo sabe guardar y buscar; no contiene reglas de negocio.
 */
const caravanas = new Map();
let siguienteId = 1;

function clonar(c) {
  return c ? { ...c } : null;
}

module.exports = {
  listar(filtros = {}) {
    let lista = [...caravanas.values()];
    if (filtros.estado) lista = lista.filter((c) => c.estado === filtros.estado);
    return lista.map(clonar);
  },

  buscarPorId(id) {
    return clonar(caravanas.get(id));
  },

  buscarPorRey(rey) {
    return clonar([...caravanas.values()].find((c) => c.rey === rey));
  },

  buscarPorOfrenda(ofrenda) {
    return clonar([...caravanas.values()].find((c) => c.ofrenda === ofrenda));
  },

  crear(datos) {
    const caravana = { id: siguienteId++, ...datos };
    caravanas.set(caravana.id, caravana);
    return clonar(caravana);
  },

  actualizar(id, cambios) {
    const actual = caravanas.get(id);
    if (!actual) return null;
    const actualizada = { ...actual, ...cambios, id };
    caravanas.set(id, actualizada);
    return clonar(actualizada);
  },

  // Solo para pruebas
  _limpiar() {
    caravanas.clear();
    siguienteId = 1;
  },
};
