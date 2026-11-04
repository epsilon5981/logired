// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Cliente de LogiRed y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Un cliente es la empresa o persona que contrata los envíos de LogiRed.
// Atributos (contrato): id, nombre, nit, email, telefono, ciudad, direccion, activo
// =====================================================================

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// NIT colombiano: 6 a 10 dígitos, con dígito de verificación opcional (900123456-7)
const NIT_VALIDO = /^\d{6,10}(-\d)?$/;
// Teléfono: 7 a 10 dígitos (fijo o celular), sin espacios
const TELEFONO_VALIDO = /^\d{7,10}$/;

function textoNoVacio(valor) {
  return typeof valor === 'string' && valor.trim() !== '';
}

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarCliente(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del cliente'];
  }
  if (!textoNoVacio(datos.nombre)) {
    errores.push('nombre es obligatorio');
  }
  if (typeof datos.nit !== 'string' || !NIT_VALIDO.test(datos.nit.trim())) {
    errores.push('nit es obligatorio: de 6 a 10 dígitos, con dígito de verificación opcional (ej. 900123456-7)');
  }
  if (typeof datos.email !== 'string' || !EMAIL_VALIDO.test(datos.email.trim())) {
    errores.push('email es obligatorio y debe tener un formato válido');
  }
  if (typeof datos.telefono !== 'string' || !TELEFONO_VALIDO.test(datos.telefono.trim())) {
    errores.push('telefono es obligatorio: de 7 a 10 dígitos, sin espacios');
  }
  if (!textoNoVacio(datos.ciudad)) {
    errores.push('ciudad es obligatoria');
  }
  if (!textoNoVacio(datos.direccion)) {
    errores.push('direccion es obligatoria');
  }
  if (datos.activo !== undefined && typeof datos.activo !== 'boolean') {
    errores.push('activo debe ser true o false');
  }
  return errores;
}

// Construye un cliente "limpio" solo con los campos permitidos
function construirCliente(datos) {
  return {
    nombre: datos.nombre.trim(),
    nit: datos.nit.trim(),
    email: datos.email.trim().toLowerCase(),
    telefono: datos.telefono.trim(),
    ciudad: datos.ciudad.trim(),
    direccion: datos.direccion.trim(),
    activo: datos.activo === undefined ? true : datos.activo,
  };
}

module.exports = { validarCliente, construirCliente };
