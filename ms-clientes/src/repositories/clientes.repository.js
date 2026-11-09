// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) · versión MySQL
// Única capa que sabe DÓNDE se guardan los datos.
// Las funciones conservan el mismo nombre, parámetros y tipo de resultado
// que la versión en memoria: por eso el servicio no cambió.
// Todas las consultas usan parámetros (?) para evitar la inyección SQL.
// =====================================================================
const pool = require('../db');

// MySQL guarda BOOLEAN como 0/1: el repositorio lo traduce al formato del contrato
function aCliente(fila) {
  return { ...fila, activo: Boolean(fila.activo) };
}

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM clientes';
  const condiciones = [];
  const valores = [];
  if (filtros.ciudad) {
    condiciones.push('ciudad = ?');
    valores.push(filtros.ciudad);
  }
  if (filtros.ids) {                              // ?ids=1,2,3 -> WHERE id IN (1, 2, 3)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas.map(aCliente);
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return filas.length > 0 ? aCliente(filas[0]) : null;
}

async function findByNit(nit) {
  const [filas] = await pool.query('SELECT * FROM clientes WHERE nit = ?', [nit]);
  return filas.length > 0 ? aCliente(filas[0]) : null;
}

async function create(cliente) {
  const [resultado] = await pool.query(
    'INSERT INTO clientes (nombre, nit, email, telefono, ciudad, direccion, activo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [cliente.nombre, cliente.nit, cliente.email, cliente.telefono, cliente.ciudad, cliente.direccion, cliente.activo]);
  return findById(resultado.insertId);           // MySQL devuelve el id generado
}

// Reemplaza los datos del cliente; devuelve el cliente actualizado o null si no existe
async function update(id, cliente) {
  const [resultado] = await pool.query(
    'UPDATE clientes SET nombre = ?, nit = ?, email = ?, telefono = ?, ciudad = ?, direccion = ?, activo = ? WHERE id = ?',
    [cliente.nombre, cliente.nit, cliente.email, cliente.telefono, cliente.ciudad, cliente.direccion, cliente.activo, id]);
  if (resultado.affectedRows === 0) return null; // ninguna fila con ese id
  return findById(id);
}

// Elimina el cliente; devuelve true si existía
async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNit, create, update, remove };
