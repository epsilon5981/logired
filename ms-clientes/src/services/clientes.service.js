// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/clientes.repository');
const { validarCliente, construirCliente } = require('../models/cliente');
const HttpError = require('../utils/http-error');

async function listar(filtros = {}) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const cliente = await repo.findById(id);
  if (!cliente) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return cliente;
}

async function crear(datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const cliente = construirCliente(datos);

  // Regla de negocio: el NIT identifica legalmente a la empresa cliente,
  // así que no puede haber dos clientes con el mismo NIT. 409 = Conflict.
  if (await repo.findByNit(cliente.nit)) {
    throw new HttpError(409, `Ya existe un cliente con el NIT ${cliente.nit}`);
  }

  return repo.create(cliente);
}

async function actualizar(id, datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  await obtener(id);                                   // 404 si no existe

  const cliente = construirCliente(datos);

  // Misma regla de negocio: el NIT nuevo no puede pertenecer a OTRO cliente
  const otro = await repo.findByNit(cliente.nit);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un cliente con el NIT ${cliente.nit}`);
  }

  return repo.update(id, cliente);
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el cliente con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
