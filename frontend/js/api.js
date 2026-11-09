// =====================================================================
// ACCESO A LA API · todas las páginas piden y envían datos SOLO por aquí
// Con CONFIG.USAR_DATOS_EJEMPLO = true trabaja sobre los archivos de
// datos/ (copiados a sessionStorage para poder crear, editar y eliminar).
// Con false hace las peticiones reales al gateway con el token JWT.
// =====================================================================
class ErrorApi extends Error {
  constructor(status, cuerpo) {
    super(cuerpo?.error || `Error ${status}`);
    this.status = status;
    this.detalles = cuerpo?.detalles || [];
  }
}

// ---------- Modo real: peticiones HTTP al API Gateway ----------
async function pedir(metodo, ruta, cuerpo) {
  const respuesta = await fetch(`${CONFIG.API_URL}${ruta}`, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Sesion.token()}`,
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined,
  });
  if (respuesta.status === 401) Sesion.cerrar();            // token vencido o inválido
  if (respuesta.status === 204) return null;
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos);
  return datos;
}

// ---------- Modo ejemplo: simula la API sobre los archivos JSON ----------
async function tabla(recurso) {
  const guardado = sessionStorage.getItem(`datos_${recurso}`);
  if (guardado) return JSON.parse(guardado);
  const respuesta = await fetch(`datos/${recurso}.json`);
  const datos = await respuesta.json();
  sessionStorage.setItem(`datos_${recurso}`, JSON.stringify(datos));
  return datos;
}
function guardarTabla(recurso, datos) {
  sessionStorage.setItem(`datos_${recurso}`, JSON.stringify(datos));
}
function hoy() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
}
// Igual que ms-envios: agrega el objeto cliente a cada envío
async function componerEnvio(envio) {
  const c = (await tabla('clientes')).find((x) => x.id === envio.cliente_id);
  return { ...envio, cliente: c ? { id: c.id, nombre: c.nombre, ciudad: c.ciudad } : null };
}
const ejemplo = {
  async listar(recurso) { return tabla(recurso); },
  async obtener(recurso, id) {
    const r = (await tabla(recurso)).find((x) => x.id === id);
    if (!r) throw new ErrorApi(404, { error: `No existe el registro con id ${id}` });
    return r;
  },
  async crear(recurso, datos) {
    const lista = await tabla(recurso);
    let nuevo = { id: Math.max(0, ...lista.map((x) => x.id)) + 1, ...datos };
    if (recurso === 'envios') nuevo = await componerEnvio({ ...nuevo, estado: 'registrado', fecha_registro: hoy() });
    if (recurso !== 'envios' && nuevo.activo === undefined) nuevo.activo = true;
    lista.push(nuevo);
    guardarTabla(recurso, lista);
    return nuevo;
  },
  async actualizar(recurso, id, datos) {
    const lista = await tabla(recurso);
    const i = lista.findIndex((x) => x.id === id);
    if (i === -1) throw new ErrorApi(404, { error: `No existe el registro con id ${id}` });
    let actualizado = { ...lista[i], ...datos, id };
    if (recurso === 'envios') actualizado = await componerEnvio(actualizado);
    lista[i] = actualizado;
    guardarTabla(recurso, lista);
    return actualizado;
  },
  async eliminar(recurso, id) {
    const lista = await tabla(recurso);
    guardarTabla(recurso, lista.filter((x) => x.id !== id));
    return null;
  },
};

// ---------- Interfaz que usan las páginas ----------
const Api = {
  async login(email, password) {
    const r = await fetch(`${CONFIG.API_URL}/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const datos = await r.json();
    if (!r.ok) throw new ErrorApi(r.status, datos);
    return datos;                                             // { token, usuario }
  },
  listar: (recurso, query = '') =>
    CONFIG.USAR_DATOS_EJEMPLO ? ejemplo.listar(recurso) : pedir('GET', `/${recurso}${query}`),
  obtener: (recurso, id) =>
    CONFIG.USAR_DATOS_EJEMPLO ? ejemplo.obtener(recurso, id) : pedir('GET', `/${recurso}/${id}`),
  crear: (recurso, datos) =>
    CONFIG.USAR_DATOS_EJEMPLO ? ejemplo.crear(recurso, datos) : pedir('POST', `/${recurso}`, datos),
  actualizar: (recurso, id, datos) =>
    CONFIG.USAR_DATOS_EJEMPLO ? ejemplo.actualizar(recurso, id, datos) : pedir('PUT', `/${recurso}/${id}`, datos),
  eliminar: (recurso, id) =>
    CONFIG.USAR_DATOS_EJEMPLO ? ejemplo.eliminar(recurso, id) : pedir('DELETE', `/${recurso}/${id}`),
};
