# ms-clientes · LogiRed (Taller 1, Módulo 3)

Microservicio de **clientes** de LogiRed con Node.js + Express organizado en capas.
Versión del Taller 1: datos en memoria y tres operaciones (listar, obtener por id, crear).

## Cómo ejecutarlo

```
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run dev
```

Prueben: http://localhost:3002/health y http://localhost:3002/clientes

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/clientes.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/clientes.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/clientes.service.js | Lógica de negocio | Validaciones y reglas (NIT único); no conoce HTTP ni la base de datos |
| src/repositories/clientes.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/cliente.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Contrato

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

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-clientes","estado":"ok"}` |
| GET | /clientes | 200 arreglo de clientes |
| GET | /clientes/:id | 200 cliente · 400 id inválido · 404 no existe |
| POST | /clientes | 201 cliente creado + Location · 400 datos inválidos · 409 NIT repetido |

Ejemplo de cuerpo para POST:
`{"nombre": "Café Quindío Ltda", "nit": "900555111-3", "email": "envios@cafequindio.co", "telefono": "6067451200", "ciudad": "Armenia", "direccion": "Calle 21 # 14-30"}`

Consumidores: ms-envios (Taller 3) usará `GET /clientes/:id` para validar y `GET /clientes?ids=…` para componer.
