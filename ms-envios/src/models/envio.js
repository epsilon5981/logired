// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Envío de LogiRed y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Atributos (contrato): id, numero_guia, cliente_id, peso_kg,
// ciudad_destino, direccion_destino, estado, fecha_registro
//
// cliente_id es una REFERENCIA a ms-clientes: aquí solo se guarda el id,
// nunca una copia de los datos del cliente. En el Taller 3 el servicio
// validará que el cliente exista (GET /clientes/:id) y compondrá el
// objeto "cliente" en las respuestas (GET /clientes?ids=...).
// =====================================================================

// Estados por los que pasa un envío. Al crearlo siempre queda "registrado";
// los cambios de estado llegan con PUT (que debe traer el estado).
const ESTADOS = ['registrado', 'en_transito', 'entregado', 'devuelto'];

// Número de guía de LogiRed: LR-<año>-<6 dígitos>, ej. LR-2026-000123
const GUIA_VALIDA = /^LR-\d{4}-\d{6}$/;

// Peso máximo que acepta un envío (capacidad del vehículo más grande de la flota)
const PESO_MAXIMO_KG = 5000;

function textoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Devuelve una lista de errores de validación (vacía si todo está bien).
// Con { actualizar: true } (PUT) el estado también es obligatorio.
function validarEnvio(datos, { actualizar = false } = {}) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del envío'];
  }
  if (typeof datos.numero_guia !== 'string' || !GUIA_VALIDA.test(datos.numero_guia.trim().toUpperCase())) {
    errores.push('numero_guia es obligatorio con el formato LR-AAAA-NNNNNN (ej. LR-2026-000123)');
  }
  if (!Number.isInteger(datos.cliente_id) || datos.cliente_id <= 0) {
    errores.push('cliente_id es obligatorio y debe ser un entero positivo');
  }
  if (typeof datos.peso_kg !== 'number' || !(datos.peso_kg > 0) || datos.peso_kg > PESO_MAXIMO_KG) {
    errores.push(`peso_kg es obligatorio: un número mayor que 0 y hasta ${PESO_MAXIMO_KG}`);
  }
  if (!textoNoVacio(datos.ciudad_destino)) {
    errores.push('ciudad_destino es obligatoria');
  }
  if (!textoNoVacio(datos.direccion_destino)) {
    errores.push('direccion_destino es obligatoria');
  }
  if (actualizar && !ESTADOS.includes(datos.estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS.join(', ')}`);
  }
  return errores;
}

// Construye un envío "limpio" solo con los campos permitidos.
// Al crear, estado y fecha_registro NO se reciben: los asigna la capa de servicio.
// Al actualizar se recibe el estado; fecha_registro nunca se modifica.
function construirEnvio(datos, { actualizar = false } = {}) {
  const envio = {
    numero_guia: datos.numero_guia.trim().toUpperCase(),
    cliente_id: datos.cliente_id,
    peso_kg: datos.peso_kg,
    ciudad_destino: datos.ciudad_destino.trim(),
    direccion_destino: datos.direccion_destino.trim(),
  };
  if (actualizar) envio.estado = datos.estado;
  return envio;
}

module.exports = { ESTADOS, validarEnvio, construirEnvio };
