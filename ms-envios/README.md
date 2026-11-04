# ms-envios · LogiRed (Taller 1, Módulo 3)

Microservicio de **envíos** de LogiRed con Node.js + Express organizado en capas.
Versión del Taller 1: datos en memoria y tres operaciones (listar, obtener por id, crear).

## Cómo ejecutarlo

```
npm install
copy .env.example .env      # en Linux/Mac: cp .env.example .env
npm run dev
```

Prueben: http://localhost:3003/health y http://localhost:3003/envios

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/envios.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/envios.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/envios.service.js | Lógica de negocio | Guía única, estado inicial y fecha de registro; no conoce HTTP ni la base de datos |
| src/repositories/envios.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/envio.js | Modelo | Atributos de la entidad, estados válidos y validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Contrato

`cliente_id` es lo único que se guarda; el objeto `cliente` lo compondrá el servicio en el Taller 3 consultando a ms-clientes.

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

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-envios","estado":"ok"}` |
| GET | /envios | 200 arreglo de envíos |
| GET | /envios/:id | 200 envío · 400 id inválido · 404 no existe |
| POST | /envios | 201 envío creado + Location · 400 datos inválidos · 409 guía repetida |

Ejemplo de cuerpo para POST (estado y fecha_registro los asigna el servicio):
`{"numero_guia": "LR-2026-000123", "cliente_id": 3, "peso_kg": 2.5, "ciudad_destino": "Medellín", "direccion_destino": "Carrera 43A # 1-50"}`

Estados válidos: registrado, en_transito, entregado, devuelto.
