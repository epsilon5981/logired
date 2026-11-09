// =====================================================================
// SESIÓN Y PERMISOS
// Guarda quién inició sesión, protege las páginas y arma el encabezado.
// =====================================================================
const ROLES = {
  administrador: { nombre: 'Administrador', inicio: 'inicio.html' },
  despacho: { nombre: 'Despacho', inicio: 'envios.html' },
  flota: { nombre: 'Flota', inicio: 'envios.html' },
};

// Páginas que ve cada rol (mapa de navegación del Taller 1)
const PAGINAS = [
  { href: 'inicio.html', texto: 'Panel', roles: ['administrador'] },
  { href: 'envios.html', texto: 'Envíos', roles: ['administrador', 'despacho', 'flota'] },
  { href: 'clientes.html', texto: 'Clientes', roles: ['administrador', 'despacho'] },
  { href: 'usuarios.html', texto: 'Usuarios', roles: ['administrador'] },
];

// Roles que pueden crear, modificar y eliminar (tabla de permisos del Taller 1).
// Ocultar botones es solo comodidad: quien protege de verdad es el microservicio (403).
const PUEDEN_ESCRIBIR = {
  usuarios: ['administrador'],
  clientes: ['administrador', 'despacho'],
  envios: ['administrador', 'despacho'],
};

const Sesion = {
  guardar(token, usuario) {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
  },
  usuario() {
    try { return JSON.parse(sessionStorage.getItem('usuario')); } catch { return null; }
  },
  token() { return sessionStorage.getItem('token'); },
  cerrar() {
    sessionStorage.clear();
    location.href = 'index.html';
  },
  puedeEscribir(recurso) {
    const u = this.usuario();
    return !!u && PUEDEN_ESCRIBIR[recurso].includes(u.rol);
  },
  // Protege una página: sin sesión -> login; rol sin acceso -> su página de inicio
  exigir(pagina) {
    const u = this.usuario();
    if (!u) { location.href = 'index.html'; return null; }
    const p = PAGINAS.find((x) => x.href === pagina);
    if (p && !p.roles.includes(u.rol)) { location.href = ROLES[u.rol].inicio; return null; }
    return u;
  },
};

// Dibuja el encabezado común: marca, menú según el rol, nombre, rol y salir
function pintarEncabezado(paginaActual) {
  const u = Sesion.usuario();
  const opciones = PAGINAS.filter((p) => p.roles.includes(u.rol));
  const header = document.createElement('header');
  header.className = 'barra';
  header.innerHTML = `
    <a class="marca" href="${ROLES[u.rol].inicio}"><span class="marca-logo">LR</span><span>LogiRed</span></a>
    <button class="menu-boton" aria-label="Abrir menú" aria-expanded="false">☰</button>
    <nav class="menu">
      ${opciones.map((m) => `<a href="${m.href}" class="${m.href === paginaActual ? 'activo' : ''}">${m.texto}</a>`).join('')}
    </nav>
    <div class="usuario">
      <div><strong>${escapar(u.nombre)}</strong><span class="rol rol-${u.rol}">${ROLES[u.rol].nombre}</span></div>
      <button class="boton boton-claro" id="salir">Cerrar sesión</button>
    </div>`;
  document.body.prepend(header);
  header.querySelector('#salir').addEventListener('click', () => Sesion.cerrar());
  const boton = header.querySelector('.menu-boton');
  boton.addEventListener('click', () => {
    const abierto = header.classList.toggle('abierto');
    boton.setAttribute('aria-expanded', abierto);
  });
}

// Evita que un texto con < o > se interprete como HTML
function escapar(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
