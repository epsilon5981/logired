// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión en memoria (se pierden al reiniciar).
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'Distribuidora El Valle', nit: '900123456-7', email: 'compras@elvalle.com.co', telefono: '6023456789', ciudad: 'Cali', direccion: 'Calle 15 # 32-40', activo: true },
  { id: 2, nombre: 'Textiles Antioquia S.A.S.', nit: '901234567-1', email: 'logistica@textilesantioquia.co', telefono: '6044412233', ciudad: 'Medellín', direccion: 'Carrera 50 # 10-25', activo: true },
  { id: 3, nombre: 'Ferretería La Sabana', nit: '830045678-2', email: 'pedidos@lasabana.com', telefono: '6017654321', ciudad: 'Bogotá', direccion: 'Avenida 68 # 22-15', activo: false },
];
let siguienteId = 4;

async function findAll(filtros = {}) {
  let resultado = clientes;
  if (filtros.ciudad) {
    const ciudad = filtros.ciudad.toLowerCase();
    resultado = resultado.filter((c) => c.ciudad.toLowerCase() === ciudad);
  }
  if (filtros.ids) {
    resultado = resultado.filter((c) => filtros.ids.includes(c.id));
  }
  return resultado;
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

// Reemplaza los datos del cliente; devuelve el cliente actualizado o null si no existe
async function update(id, cliente) {
  const i = clientes.findIndex((c) => c.id === id);
  if (i === -1) return null;
  clientes[i] = { id, ...cliente };
  return clientes[i];
}

// Elimina el cliente; devuelve true si existía
async function remove(id) {
  const i = clientes.findIndex((c) => c.id === id);
  if (i === -1) return false;
  clientes.splice(i, 1);
  return true;
}

module.exports = { findAll, findById, findByNit, create, update, remove };
