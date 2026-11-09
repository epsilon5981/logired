# Frontend · LogiRed

Interfaz web de LogiRed con HTML, CSS y JavaScript sin frameworks: archivos estáticos que Apache podrá servir en el Taller 3.

## Cómo verlo en su PC

Los datos de ejemplo se leen con `fetch`, así que las páginas deben abrirse desde un servidor local (no con doble clic). En la carpeta del repositorio:

```
npx serve frontend -l 5500
```

y abran http://localhost:5500. También sirve la extensión *Live Server* de VS Code.

## Organización

| Archivo | Responsabilidad |
|---|---|
| js/config.js | **Único lugar que cambia en el Taller 3**: `USAR_DATOS_EJEMPLO` y `API_URL` |
| js/api.js | Todas las peticiones a la API (o a los datos de ejemplo) y el envío del token |
| js/sesion.js | Sesión, páginas por rol, permisos de escritura y encabezado común |
| js/ui.js | Formularios en diálogo, confirmaciones y mensajes |
| js/inicio.js, envios.js | Panel del administrador y lista de envíos (inicio de despacho y flota) |
| datos/*.json | Datos de ejemplo con la misma forma que los contratos (los envíos traen su objeto cliente) |

## Páginas por rol

| Rol | Página de inicio | Otras páginas | Acciones |
|---|---|---|---|
| administrador | Panel (inicio.html) | Envíos, Clientes, Usuarios | Ver, crear, editar, eliminar |
| despacho | Envíos | Clientes | Ver, crear, editar, eliminar envíos y clientes |
| flota | Envíos por despachar | — | Solo ver |

Ocultar botones es una comodidad: quien protege de verdad cada operación es el microservicio (403).
