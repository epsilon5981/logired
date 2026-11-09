// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, query, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// Le pasa al servicio el token (cabecera Authorization) como un dato más.
// =====================================================================
const service = require('../services/envios.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /envios  ·  GET /envios?estado=en_transito  ·  GET /envios?cliente_id=1
async function listar(req, res) {
  const filtros = { estado: req.query.estado };
  if (req.query.cliente_id !== undefined) {
    filtros.cliente_id = Number(req.query.cliente_id);
    if (!Number.isInteger(filtros.cliente_id) || filtros.cliente_id <= 0) {
      throw new HttpError(400, 'cliente_id debe ser un entero positivo');
    }
  }
  const envios = await service.listar(filtros, req.headers.authorization);
  res.status(200).json(envios);
}

// GET /envios/:id
async function obtener(req, res) {
  const envio = await service.obtener(leerId(req), req.headers.authorization);
  res.status(200).json(envio);
}

// POST /envios
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /envios/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body, req.headers.authorization);
  res.status(200).json(actualizado);
}

// DELETE /envios/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end();                                // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
