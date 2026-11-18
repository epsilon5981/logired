// =====================================================================
// CONFIGURACIÓN DEL FRONTEND · el único lugar que cambia entre ambientes
// =====================================================================
const CONFIG = {
  // false = peticiones reales al API Gateway con el token de ms-usuarios (Taller 3)
  // true  = datos de ejemplo (carpeta datos/) e inicio de sesión simulado (Taller 2)
  USAR_DATOS_EJEMPLO: false,

  // Dirección de la API: ruta relativa, porque el frontend y el gateway se sirven
  // desde el mismo nombre (http://app.<dominio>). Apache reenvía /api/<recurso>
  // al microservicio que corresponde.
  API_URL: '/api',
};
