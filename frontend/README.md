# Frontend · LogiRed

Interfaz web de LogiRed con HTML, CSS y JavaScript sin frameworks: archivos estáticos que Apache podrá servir en el Taller 3.

## Cómo se publica (Taller 3)

El frontend se sirve desde Apache en servidor2, en el mismo host virtual que el API Gateway (`http://app.<dominio>`). Por eso todas las llamadas usan la ruta relativa `/api/<recurso>` y no hace falta CORS.

```
sudo cp -r /srv/logired/app/frontend/* /var/www/app/
```

Para volver a los datos de ejemplo (sin backend), cambie `USAR_DATOS_EJEMPLO` a `true` en `js/config.js` y abra la carpeta con un servidor local (`npx serve frontend -l 5500`).

## Organización

| Archivo | Responsabilidad |
|---|---|
| js/config.js | **Único lugar que cambia en el Taller 3**: `USAR_DATOS_EJEMPLO` y `API_URL` |
| js/api.js | Todas las peticiones a la API: agrega el token, maneja 401 (vuelve al inicio de sesión) y convierte 400/403/409/503 en mensajes |
| js/sesion.js | Sesión, páginas por rol, permisos de escritura y encabezado común |
| js/ui.js | Formularios en diálogo, confirmaciones y mensajes |
| js/inicio.js, envios.js, clientes.js, usuarios.js | Una página por pantalla del mapa de navegación |
| datos/*.json | Datos de ejemplo con la misma forma que los contratos (los envíos traen su objeto cliente) |

## Páginas por rol

| Rol | Página de inicio | Otras páginas | Acciones |
|---|---|---|---|
| administrador | Panel (inicio.html) | Envíos, Clientes, Usuarios | Ver, crear, editar, eliminar |
| despacho | Envíos | Clientes | Ver, crear, editar, eliminar envíos y clientes |
| flota | Envíos por despachar | — | Solo ver |

Ocultar botones es una comodidad: quien protege de verdad cada operación es el microservicio (403).
