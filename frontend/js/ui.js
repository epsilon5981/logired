// =====================================================================
// UTILIDADES DE INTERFAZ: mensajes, formularios en diálogo y confirmación
// =====================================================================
function mostrarMensaje(texto, tipo = 'ok') {
  const t = document.createElement('div');
  t.className = `toast ${tipo === 'error' ? 'error' : ''}`;
  t.textContent = texto;
  document.body.append(t);
  setTimeout(() => t.remove(), 3200);
}

// Muestra un error de la API (incluida la lista de detalles de validación)
function textoError(error) {
  return [error.message, ...(error.detalles || [])].join(' · ');
}

// Abre un formulario en un diálogo. campos = [{ nombre, etiqueta, tipo, opciones, ancho, paso }]
// Llama a guardar(datos); si lanza un error, lo muestra sin cerrar el diálogo.
function abrirFormulario({ titulo, campos, valores = {}, guardar }) {
  const d = document.createElement('dialog');
  d.innerHTML = `<form novalidate>
      <h2>${escapar(titulo)}</h2>
      <div class="campos">${campos.map((c) => campoHtml(c, valores[c.nombre])).join('')}</div>
      <p class="errores"></p>
      <div class="botones">
        <button type="button" class="boton boton-secundario" data-cerrar>Cancelar</button>
        <button type="submit" class="boton">Guardar</button>
      </div>
    </form>`;
  document.body.append(d);
  d.showModal();
  d.querySelector('[data-cerrar]').onclick = () => d.close();
  d.addEventListener('close', () => d.remove());
  d.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const datos = {};
    for (const c of campos) {
      const el = d.querySelector(`[name="${c.nombre}"]`);
      if (c.tipo === 'checkbox') datos[c.nombre] = el.checked;
      else if (c.tipo === 'number' || c.tipo === 'select-numero') datos[c.nombre] = el.value === '' ? undefined : Number(el.value);
      else datos[c.nombre] = el.value.trim();
    }
    try {
      await guardar(datos);
      d.close();
    } catch (error) {
      d.querySelector('.errores').textContent = textoError(error);
    }
  });
}

function campoHtml(c, valor) {
  const clase = c.ancho ? 'ancho' : '';
  if (c.tipo === 'checkbox') {
    return `<label class="check ${clase}"><input type="checkbox" name="${c.nombre}" ${valor !== false ? 'checked' : ''}> ${escapar(c.etiqueta)}</label>`;
  }
  if (c.tipo === 'select' || c.tipo === 'select-numero') {
    return `<label class="${clase}">${escapar(c.etiqueta)}
      <select name="${c.nombre}">
        ${c.vacio ? `<option value="">${escapar(c.vacio)}</option>` : ''}
        ${c.opciones.map((o) => `<option value="${escapar(o.valor)}" ${String(o.valor) === String(valor) ? 'selected' : ''}>${escapar(o.texto)}</option>`).join('')}
      </select></label>`;
  }
  return `<label class="${clase}">${escapar(c.etiqueta)}
    <input name="${c.nombre}" type="${c.tipo || 'text'}" value="${escapar(valor ?? '')}" ${c.paso ? `step="${c.paso}"` : ''} ${c.ayuda ? `placeholder="${escapar(c.ayuda)}"` : ''}></label>`;
}

// Ventana de detalle de solo lectura. filas = [[etiqueta, valorHtml], ...]
function abrirDetalle(titulo, filas) {
  const d = document.createElement('dialog');
  d.innerHTML = `<form method="dialog">
      <h2>${escapar(titulo)}</h2>
      <dl class="detalle">${filas.map(([e, v]) => `<dt>${escapar(e)}</dt><dd>${v}</dd>`).join('')}</dl>
      <div class="botones"><button class="boton">Cerrar</button></div>
    </form>`;
  document.body.append(d);
  d.addEventListener('close', () => d.remove());
  d.showModal();
}

function confirmar(texto) {
  return new Promise((resolver) => {
    const d = document.createElement('dialog');
    d.innerHTML = `<form method="dialog">
        <h2>Confirmar</h2><p style="margin:0">${escapar(texto)}</p>
        <div class="botones">
          <button value="no" class="boton boton-secundario">Cancelar</button>
          <button value="si" class="boton" style="background:var(--rojo)">Eliminar</button>
        </div></form>`;
    document.body.append(d);
    d.addEventListener('close', () => { resolver(d.returnValue === 'si'); d.remove(); });
    d.showModal();
  });
}

function avisoModo() {
  return CONFIG.USAR_DATOS_EJEMPLO
    ? '<div class="aviso-modo">Modo de datos de ejemplo: los cambios se guardan solo en esta pestaña del navegador.</div>'
    : '';
}
