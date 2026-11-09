// =====================================================================
// MIDDLEWARE DE SEGURIDAD (tokens JWT)
// PROVISIONAL: este archivo cumple la misma interfaz que el
// src/middlewares/auth.js de ms-usuarios completo (verificarToken y
// requiereRol). Cuando la docente entregue ms-usuarios completo,
// reemplácelo por esa copia SIN CAMBIOS.
// =====================================================================
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');

// Exige un token válido en la cabecera Authorization: Bearer <token>.
// Si falta, es inválido o venció -> 401. Si es válido, deja los datos en req.usuario.
function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return next(new HttpError(401, 'Falta el token de acceso (Authorization: Bearer <token>)'));
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);   // { id, nombre, rol }
    next();
  } catch {
    next(new HttpError(401, 'Token inválido o vencido'));
  }
}

// Deja pasar solo los roles indicados; a los demás les responde 403.
function requiereRol(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return next(new HttpError(403, `Acceso denegado: se requiere uno de los roles ${roles.join(', ')}`));
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };
