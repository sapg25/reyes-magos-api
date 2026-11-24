/**
 * Capa de datos: guarda las paradas (itinerario) en memoria.
 */
const paradas = new Map();
let siguienteId = 1;

function clonar(p) {
  return p ? { ...p } : null;
}

module.exports = {
  buscarPorId(id) {
    return clonar(paradas.get(id));
  },

  // Devuelve las paradas de una caravana ordenadas por "orden"
  listarPorCaravana(caravanaId) {
    return [...paradas.values()]
      .filter((p) => p.caravanaId === caravanaId)
      .sort((a, b) => a.orden - b.orden)
      .map(clonar);
  },

  buscarPorCaravanaYOrden(caravanaId, orden) {
    return clonar(
      [...paradas.values()].find((p) => p.caravanaId === caravanaId && p.orden === orden)
    );
  },

  crear(datos) {
    const parada = { id: siguienteId++, ...datos };
    paradas.set(parada.id, parada);
    return clonar(parada);
  },

  actualizar(id, cambios) {
    const actual = paradas.get(id);
    if (!actual) return null;
    const actualizada = { ...actual, ...cambios, id };
    paradas.set(id, actualizada);
    return clonar(actualizada);
  },

  eliminar(id) {
    return paradas.delete(id);
  },
};
