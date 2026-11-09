# ms-clientes · LogiRed

Microservicio de **clientes** de LogiRed S.A.S. (empresas y personas que contratan los envíos). Node.js + Express organizado en capas, con persistencia en MySQL.

| | |
|---|---|
| Entidad | Cliente |
| Responsable | Hernán David Gutiérrez Alarcón |
| Puerto | 3002 |
| Base de datos | clientes_db (usuario clientes_user) |

## Cómo ejecutarlo

Requisitos: Node.js LTS 22.9 o superior y MySQL Server 8 (con MySQL Workbench o la consola `mysql`).

**1. Crear la base de datos y su usuario** (en Workbench o en la consola, conectado como `root`):

```sql
CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY '<una-clave-segura>';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';
```

**2. Crear la tabla y los registros iniciales** con `db/schema.sql`. En Workbench: *File → Open SQL Script*, conectado como `clientes_user`, y ejecutar. O desde la consola, en la carpeta del microservicio:

```
mysql -u clientes_user -p clientes_db
mysql> SOURCE db/schema.sql;
```

**3. Configurar y arrancar:**

```
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run dev
```

En el `.env` ponga la clave de MySQL:

```
PORT=3002
HOST=127.0.0.1
DB_HOST=localhost
DB_PORT=3306
DB_NAME=clientes_db
DB_USER=clientes_user
DB_PASSWORD=<la clave que eligió>
```

Debe ver en la terminal: `ms-clientes escuchando en http://127.0.0.1:3002`.

## Representación y atributos

Así responde `GET /clientes/1`:

```json
{
  "id": 1,
  "nombre": "Distribuidora El Valle",
  "nit": "900123456-7",
  "email": "compras@elvalle.com.co",
  "telefono": "6023456789",
  "ciudad": "Cali",
  "direccion": "Calle 15 # 32-40",
  "activo": true
}
```

| Atributo | Tipo | ¿Obligatorio al crear? | Reglas |
|---|---|---|---|
| id | entero | No: lo asigna el servicio | Positivo y único |
| nombre | texto | Sí | No vacío; se guarda sin espacios al inicio ni al final |
| nit | texto | Sí | 6 a 10 dígitos con dígito de verificación opcional (900123456-7); **único (si se repite: 409)** |
| email | texto | Sí | Formato de correo válido; se guarda en minúsculas |
| telefono | texto | Sí | 7 a 10 dígitos, sin espacios |
| ciudad | texto | Sí | No vacía |
| direccion | texto | Sí | No vacía |
| activo | booleano | No (por defecto true) | Solo true o false |

## Endpoints

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | /clientes | — | 200 + arreglo | — |
| Filtrar | GET | /clientes?ciudad=Cali | — | 200 + arreglo filtrado | — |
| Consultar por lotes | GET | /clientes?ids=1,3,8 | — | 200 + arreglo con esos registros | 400 ids inválidos |
| Obtener | GET | /clientes/:id | — | 200 + objeto | 400 id inválido · 404 |
| Crear | POST | /clientes | JSON sin id | 201 + objeto + cabecera Location | 400 · 409 |
| Actualizar | PUT | /clientes/:id | JSON completo sin id | 200 + objeto actualizado | 400 · 404 · 409 |
| Eliminar | DELETE | /clientes/:id | — | 204 sin cuerpo | 400 · 404 |

Los filtros se pueden combinar (`?ciudad=Cali&ids=1,2`). Todos los errores responden con el formato `{"error": "...", "detalles": [...]}` (detalles solo en errores de validación).

**Ejemplo · crear:** `POST /clientes`

```json
{
  "nombre": "Café Quindío Ltda",
  "nit": "900555111-3",
  "email": "envios@cafequindio.co",
  "telefono": "6067451200",
  "ciudad": "Armenia",
  "direccion": "Calle 21 # 14-30"
}
```

Respuesta `201 Created` con `Location: /clientes/4`:

```json
{ "id": 4, "nombre": "Café Quindío Ltda", "nit": "900555111-3", "email": "envios@cafequindio.co", "telefono": "6067451200", "ciudad": "Armenia", "direccion": "Calle 21 # 14-30", "activo": true }
```

**Ejemplo · listar por lotes:** `GET /clientes?ids=1,2` → `200 OK`

```json
[
  { "id": 1, "nombre": "Distribuidora El Valle", "nit": "900123456-7", "email": "compras@elvalle.com.co", "telefono": "6023456789", "ciudad": "Cali", "direccion": "Calle 15 # 32-40", "activo": true },
  { "id": 2, "nombre": "Textiles Antioquia S.A.S.", "nit": "901234567-1", "email": "logistica@textilesantioquia.co", "telefono": "6044412233", "ciudad": "Medellín", "direccion": "Carrera 50 # 10-25", "activo": true }
]
```

## Relaciones

ms-clientes no guarda referencias a otros microservicios. Es **consultado** por ms-envios:

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-envios | GET /clientes/:id · GET /clientes?ids=… | id, nombre, ciudad |

- `GET /clientes/:id`: ms-envios valida que el cliente exista al crear o actualizar un envío (200 existe, 404 no existe).
- `GET /clientes?ids=…`: ms-envios trae en una sola petición los clientes de todos los envíos que va a mostrar.

## Pruebas

La colección de Postman está en `docs/ms-clientes.postman_collection.json` (Import en Postman).
