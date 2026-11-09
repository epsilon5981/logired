# ms-envios · LogiRed

Microservicio de **envíos** de LogiRed S.A.S. Node.js + Express organizado en capas, con persistencia en MySQL. Cada envío guarda la referencia `cliente_id` a ms-clientes.

| | |
|---|---|
| Entidad | Envío |
| Responsable | Hernán David Gutiérrez Alarcón |
| Puerto | 3003 |
| Base de datos | envios_db (usuario envios_user) |

## Cómo ejecutarlo

Requisitos: Node.js LTS 22.9 o superior y MySQL Server 8 (con MySQL Workbench o la consola `mysql`). Para probar las relaciones, ms-clientes debe estar corriendo (ver su README).

**1. Crear la base de datos y su usuario** (en Workbench o en la consola, conectado como `root`):

```sql
CREATE DATABASE envios_db;
CREATE USER 'envios_user'@'localhost' IDENTIFIED BY '<una-clave-segura>';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'localhost';
```

**2. Crear la tabla y los registros iniciales** con `db/schema.sql`. En Workbench: *File → Open SQL Script*, conectado como `envios_user`, y ejecutar. O desde la consola, en la carpeta del microservicio:

```
mysql -u envios_user -p envios_db
mysql> SOURCE db/schema.sql;
```

**3. Configurar y arrancar:**

```
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run dev
```

En el `.env` ponga la clave de MySQL y la JWT_SECRET del grupo:

```
PORT=3003
HOST=127.0.0.1
DB_HOST=localhost
DB_PORT=3306
DB_NAME=envios_db
DB_USER=envios_user
DB_PASSWORD=<la clave que eligió>
JWT_SECRET=<la frase secreta del grupo>
CLIENTES_URL=http://127.0.0.1:3002
```

Debe ver en la terminal: `ms-envios escuchando en http://127.0.0.1:3003`.

## Representación y atributos

Así responde `GET /envios/3`. `cliente_id` es lo único que se guarda en envios_db; el objeto `cliente` lo agrega el servicio consultando a ms-clientes cada vez que responde.

```json
{
  "id": 3,
  "numero_guia": "LR-2026-000003",
  "cliente_id": 1,
  "peso_kg": 2.5,
  "ciudad_destino": "Cali",
  "direccion_destino": "Avenida 6N # 23-45",
  "estado": "registrado",
  "fecha_registro": "2026-11-03",
  "cliente": { "id": 1, "nombre": "Distribuidora El Valle", "ciudad": "Cali" }
}
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| numero_guia | texto | Sí | Formato LR-AAAA-NNNNNN; se guarda en mayúsculas; **único (si se repite: 409)** |
| cliente_id | entero | Sí | Entero positivo; el cliente debe existir en ms-clientes (si no: 400) |
| peso_kg | decimal | Sí | Mayor que 0 y hasta 5000 |
| ciudad_destino | texto | Sí | No vacía |
| direccion_destino | texto | Sí | No vacía |
| estado | texto | No al crear (queda "registrado"); **sí en PUT** | Uno de: registrado, en_transito, entregado, devuelto |
| fecha_registro | fecha | No: la asigna el servicio | Fecha del día del registro (AAAA-MM-DD); no cambia con PUT |
| cliente | objeto | No se envía ni se guarda | Compuesto desde ms-clientes: id, nombre, ciudad (null si ms-clientes no responde) |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /envios | — | 200 + arreglo | — |
| Filtrar | GET | /envios?estado=en_transito · /envios?cliente_id=1 | — | 200 + arreglo filtrado | 400 estado o cliente_id inválido |
| Obtener | GET | /envios/:id | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | /envios | JSON sin id, estado ni fecha | 201 + objeto + cabecera Location | 400 · 409 · 503 |
| Actualizar | PUT | /envios/:id | JSON completo sin id (incluye estado) | 200 + objeto actualizado | 400 · 404 · 409 · 503 |
| Eliminar | DELETE | /envios/:id | — | 204 sin cuerpo | 400 · 404 |

ms-envios no ofrece consulta por lotes (`?ids=`) porque ningún otro microservicio lo consulta. Todos los errores responden con el formato `{"error": "...", "detalles": [...]}`.

**Ejemplo · crear:** `POST /envios`

```json
{
  "numero_guia": "LR-2026-000123",
  "cliente_id": 3,
  "peso_kg": 2.5,
  "ciudad_destino": "Medellín",
  "direccion_destino": "Carrera 43A # 1-50"
}
```

Respuesta `201 Created` con `Location: /envios/4`:

```json
{ "id": 4, "numero_guia": "LR-2026-000123", "cliente_id": 3, "peso_kg": 2.5, "ciudad_destino": "Medellín", "direccion_destino": "Carrera 43A # 1-50", "estado": "registrado", "fecha_registro": "2026-11-04", "cliente": { "id": 3, "nombre": "Ferretería La Sabana", "ciudad": "Bogotá" } }
```

**Ejemplo · listar con filtro:** `GET /envios?estado=en_transito` → `200 OK`

```json
[
  { "id": 2, "numero_guia": "LR-2026-000002", "cliente_id": 2, "peso_kg": 340, "ciudad_destino": "Bogotá", "direccion_destino": "Calle 80 # 69-70", "estado": "en_transito", "fecha_registro": "2026-10-28", "cliente": { "id": 2, "nombre": "Textiles Antioquia S.A.S.", "ciudad": "Medellín" } }
]
```

## Seguridad

Todas las rutas exigen un token JWT emitido por ms-usuarios (`POST /usuarios/login`), enviado en la cabecera `Authorization: Bearer <token>`. El microservicio verifica la firma con `JWT_SECRET`, sin consultar a ms-usuarios.

| Operación | Roles permitidos | Sin token o token inválido | Rol sin permiso |
|---|---|---|---|
| GET (listar, filtrar, obtener) | administrador, despacho, flota | 401 | — |
| POST, PUT, DELETE | administrador, despacho | 401 | 403 |
## Relaciones

ms-envios **guarda la referencia** `cliente_id` y consulta a ms-clientes (reenviando el token del usuario):

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
|---|---|---|---|---|
| cliente_id | ms-clientes | GET /clientes/:id | GET /clientes?ids=… | id, nombre, ciudad |

- **Al escribir:** si el cliente no existe → 400; si ms-clientes no responde → 503.
- **Al leer:** una sola petición `?ids=` para todos los envíos; si ms-clientes no responde, la respuesta sale igual con `"cliente": null` y `"aviso": "ms-clientes no disponible"`.
- La dirección de ms-clientes se configura en el `.env` con `CLIENTES_URL`.

## Pruebas

La colección de Postman está en `docs/ms-envios.postman_collection.json` (Import en Postman).
