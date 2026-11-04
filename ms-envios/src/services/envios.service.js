// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
const { validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/http-error');

// Fecha de hoy en Colombia con formato AAAA-MM-DD
function fechaHoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}

async function listar() {
  return repo.findAll();
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

  // Regla de negocio: el número de guía es lo que el cliente usa para rastrear
  // su paquete, así que no puede repetirse. 409 = Conflict.
  if (await repo.findByNumeroGuia(envio.numero_guia)) {
    throw new HttpError(409, `Ya existe un envío con el número de guía ${envio.numero_guia}`);
  }

  // Regla de negocio: todo envío nuevo empieza en estado "registrado"
  // y con la fecha del día en que se registra.
  envio.estado = 'registrado';
  envio.fecha_registro = fechaHoy();

  // Taller 3: validar aquí que el cliente exista con GET /clientes/:id en ms-clientes
  // (si responde 404 -> error 400 "cliente_id no existe").

  return repo.create(envio);
}

module.exports = { listar, obtener, crear };
