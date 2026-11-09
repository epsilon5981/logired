// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio) · versión MySQL
// Única capa que sabe DÓNDE se guardan los datos.
// Las funciones conservan el mismo nombre, parámetros y tipo de resultado
// que la versión en memoria: por eso el servicio no cambió.
// Todas las consultas usan parámetros (?) para evitar la inyección SQL.
// =====================================================================
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM envios';
  const condiciones = [];
  const valores = [];
  if (filtros.estado) {
    condiciones.push('estado = ?');
    valores.push(filtros.estado);
  }
  if (filtros.cliente_id) {
    condiciones.push('cliente_id = ?');
    valores.push(filtros.cliente_id);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM envios WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByNumeroGuia(numeroGuia) {
  const [filas] = await pool.query('SELECT * FROM envios WHERE numero_guia = ?', [numeroGuia]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(envio) {
  const [resultado] = await pool.query(
    'INSERT INTO envios (numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [envio.numero_guia, envio.cliente_id, envio.peso_kg, envio.ciudad_destino, envio.direccion_destino, envio.estado, envio.fecha_registro]);
  return findById(resultado.insertId);           // MySQL devuelve el id generado
}

// Reemplaza los datos del envío (fecha_registro no se modifica);
// devuelve el envío actualizado o null si no existe
async function update(id, envio) {
  const [resultado] = await pool.query(
    'UPDATE envios SET numero_guia = ?, cliente_id = ?, peso_kg = ?, ciudad_destino = ?, direccion_destino = ?, estado = ? WHERE id = ?',
    [envio.numero_guia, envio.cliente_id, envio.peso_kg, envio.ciudad_destino, envio.direccion_destino, envio.estado, id]);
  if (resultado.affectedRows === 0) return null; // ninguna fila con ese id
  return findById(id);
}

// Elimina el envío; devuelve true si existía
async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM envios WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { findAll, findById, findByNumeroGuia, create, update, remove };
