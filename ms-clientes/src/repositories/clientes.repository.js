// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'Distribuidora El Valle', nit: '900123456-7', email: 'compras@elvalle.com.co', telefono: '6023456789', ciudad: 'Cali', direccion: 'Calle 15 # 32-40', activo: true },
  { id: 2, nombre: 'Textiles Antioquia S.A.S.', nit: '901234567-1', email: 'logistica@textilesantioquia.co', telefono: '6044412233', ciudad: 'Medellín', direccion: 'Carrera 50 # 10-25', activo: true },
  { id: 3, nombre: 'Ferretería La Sabana', nit: '830045678-2', email: 'pedidos@lasabana.com', telefono: '6017654321', ciudad: 'Bogotá', direccion: 'Avenida 68 # 22-15', activo: false },
];
let siguienteId = 4;

async function findAll() {
  return clientes;
}

async function findById(id) {
  return clientes.find((c) => c.id === id) || null;
}

async function findByNit(nit) {
  return clientes.find((c) => c.nit === nit) || null;
}

async function create(cliente) {
  const nuevo = { id: siguienteId++, ...cliente };
  clientes.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByNit, create };
