// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
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

async function listar(filtros = {}) {
  if (filtros.estado && !ESTADOS.includes(filtros.estado)) {
    throw new HttpError(400, `estado debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return repo.findAll(filtros);
}

async function obtener(id) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envío con id ${id}`);
  return envio;
}

async function crear(datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirEnvio(datos);
  await verificarGuiaUnica(envio.numero_guia);

  // Regla de negocio: todo envío nuevo empieza en estado "registrado"
  // y con la fecha del día en que se registra.
  envio.estado = 'registrado';
  envio.fecha_registro = fechaHoy();

  return repo.create(envio);
}

async function actualizar(id, datos) {
  const errores = validarEnvio(datos, { actualizar: true });
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  await obtener(id);                                   // 404 si no existe

  const envio = construirEnvio(datos, { actualizar: true });
  await verificarGuiaUnica(envio.numero_guia, id);

  return repo.update(id, envio);                       // fecha_registro no cambia
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) throw new HttpError(404, `No existe el envío con id ${id}`);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
