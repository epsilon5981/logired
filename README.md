# LogiRed S.A.S. · Aplicación web con microservicios

Redes y Servicios Multimedia · UAO · Módulo 3 (Arquitecturas distribuidas).
Aplicación web de LogiRed S.A.S., empresa de logística con sedes en Cali (principal), Medellín y Bogotá.

## Integrantes

| Integrante | Usuario de GitHub | Carpetas a cargo |
|---|---|---|
| Hernán David Gutiérrez Alarcón | epsilon5981 | ms-clientes, ms-envios, frontend |

Grupo de un solo integrante: ejerce todos los roles (Coordinador, Arquitecto, Integrador, Documentador y Relator).

## Microservicios

| Microservicio | Entidad | Responsable | Puerto | Base de datos | Referencia a (id) |
|---|---|---|---|---|---|
| ms-usuarios | Usuario | Docente | 3001 | usuarios_db | — |
| ms-clientes | Cliente | Hernán David Gutiérrez | 3002 | clientes_db | — |
| ms-envios | Envío | Hernán David Gutiérrez | 3003 | envios_db | cliente_id → ms-clientes |

Roles de la empresa: `administrador`, `despacho`, `flota`. Cada microservicio documenta su contrato, cómo ejecutarlo y sus relaciones en su propio `README.md`.

## Estructura

```
├── README.md
├── ms-usuarios/     ← entregado por la docente (no se modifica)
├── ms-clientes/     ← src/ (capas + middleware), db/schema.sql, docs/ (Postman)
├── ms-envios/       ← src/ (capas + middleware + clients/), db/schema.sql, docs/ (Postman)
├── frontend/        ← interfaz web (HTML, CSS y JavaScript)
├── postman/         ← colección del Taller 1
└── deploy/          ← archivos de despliegue (Taller 3)
```

## Cómo ejecutar todo en un PC

Requisitos: Node.js LTS 22.9 o superior y MySQL Server 8. Cada microservicio se arranca en su propia terminal siguiendo su README (crear la base con `db/schema.sql`, crear el `.env` con la misma `JWT_SECRET` y `npm run dev`). No se suben `node_modules/` ni `.env`.
