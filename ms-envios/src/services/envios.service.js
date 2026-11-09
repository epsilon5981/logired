// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// El token llega como un dato más, para reenviarlo a ms-clientes.
// =====================================================================
const repo = require('../repositories/envios.repository');
const clientesClient = require('../clients/clientes.client');
const { ESTADOS, validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/http-error');

// Fecha de hoy en Colombia con formato AAAA-MM-DD
function fechaHoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

// Regla de negocio: el número de guía es lo que el cliente usa para rastrear
// su paquete, así que no puede repetirse. 409 = Conflict.
async function verificarGuiaUnica(numeroGuia, idPropio) {
  const otro = await repo.findByNumeroGuia(numeroGuia);
  if (otro && otro.id !== idPropio) {
    throw new HttpError(409, `Ya existe un envío con el número de guía ${numeroGuia}`);
  }
}

// Relación (validación): el cliente referenciado debe existir en ms-clientes.
// Si no existe -> 400; si ms-clientes no responde, el cliente HTTP lanza 503.
async function verificarCliente(clienteId, token) {
  if (!(await clientesClient.existeCliente(clienteId, token))) {
    throw new HttpError(400, `No existe el cliente con id ${clienteId}`);
  }
}

// Relación (composición): agrega a cada envío su objeto cliente,
// con UNA sola consulta a ms-clientes (?ids=...)
async function componer(envios, token) {
  const ids = [...new Set(envios.map((e) => e.cliente_id))];
  const clientes = await clientesClient.clientesPorIds(ids, token);
  if (!clientes) {                                    // degradación controlada
    return envios.map((e) =>
      ({ ...e, cliente: null, aviso: 'ms-clientes no disponible' }));
  }
  return envios.map((e) => ({ ...e, cliente: clientes.get(e.cliente_id) || null }));
}

async function listar(filtros = {}, token) {
  if (filtros.estado && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return componer(await repo.findAll(filtros), token);
}

// Busca el envío sin componer (404 si no existe)
async function buscar(id) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envío con id ${id}`);
  return envio;
}

async function obtener(id, token) {
  const [compuesto] = await componer([await buscar(id)], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirEnvio(datos);
  await verificarCliente(envio.cliente_id, token);
  await verificarGuiaUnica(envio.numero_guia);

  // Regla de negocio: todo envío nuevo empieza en estado "registrado"
  // y con la fecha del día en que se registra.
  envio.estado = 'registrado';
  envio.fecha_registro = fechaHoy();

  const nuevo = await repo.create(envio);
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const errores = validarEnvio(datos, { actualizar: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  await buscar(id);                                    // 404 si no existe

  const envio = construirEnvio(datos, { actualizar: true });
  await verificarCliente(envio.cliente_id, token);
  await verificarGuiaUnica(envio.numero_guia, id);

  const actualizado = await repo.update(id, envio);    // fecha_registro no cambia
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el envío con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
