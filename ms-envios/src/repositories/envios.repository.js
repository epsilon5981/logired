// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const envios = [
  { id: 1, numero_guia: 'LR-2026-000001', cliente_id: 1, peso_kg: 12.5, ciudad_destino: 'Medellín', direccion_destino: 'Carrera 43A # 1-50', estado: 'entregado', fecha_registro: '2026-10-20' },
  { id: 2, numero_guia: 'LR-2026-000002', cliente_id: 2, peso_kg: 340, ciudad_destino: 'Bogotá', direccion_destino: 'Calle 80 # 69-70', estado: 'en_transito', fecha_registro: '2026-10-28' },
  { id: 3, numero_guia: 'LR-2026-000003', cliente_id: 1, peso_kg: 2.5, ciudad_destino: 'Cali', direccion_destino: 'Avenida 6N # 23-45', estado: 'registrado', fecha_registro: '2026-11-03' },
];
let siguienteId = 4;

async function findAll() {
  return envios;
}

async function findById(id) {
  return envios.find((e) => e.id === id) || null;
}

async function findByNumeroGuia(numeroGuia) {
  return envios.find((e) => e.numero_guia === numeroGuia) || null;
}

async function create(envio) {
  const nuevo = { id: siguienteId++, ...envio };
  envios.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByNumeroGuia, create };
