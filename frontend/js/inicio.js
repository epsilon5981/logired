// Panel de inicio del administrador: totales de usuarios, clientes y envíos
if (Sesion.exigir('inicio.html')) {
  pintarEncabezado('inicio.html');
  document.getElementById('aviso').innerHTML = avisoModo();
  cargar();
}

async function cargar() {
  try {
    const [usuarios, clientes, envios] = await Promise.all([
      Api.listar('usuarios'), Api.listar('clientes'), Api.listar('envios'),
    ]);
    const cuenta = (estado) => envios.filter((e) => e.estado === estado).length;
    const datos = [
      ['Usuarios', usuarios.length],
      ['Clientes activos', `${clientes.filter((c) => c.activo).length} / ${clientes.length}`],
      ['Envíos registrados', cuenta('registrado')],
      ['Envíos en tránsito', cuenta('en_transito')],
      ['Envíos entregados', cuenta('entregado')],
    ];
    document.getElementById('indicadores').innerHTML = datos
      .map(([t, v]) => `<div class="tarjeta indicador"><span>${t}</span><strong>${v}</strong></div>`).join('');
  } catch (error) {
    mostrarMensaje(textoError(error), 'error');
  }
}
