# LogiRed S.A.S. · Aplicación web con microservicios

Redes y Servicios Multimedia · UAO · Módulo 3 (Arquitecturas distribuidas).
Aplicación web de LogiRed S.A.S., empresa de logística con sedes en Cali (principal), Medellín y Bogotá.

## Integrantes

| Integrante | Usuario de GitHub | Rol en la semana 1 | Carpetas a cargo |
|---|---|---|---|
| Hernán David Gutiérrez Alarcón | `<usuario-github>` | Coordinador, Arquitecto, Integrador, Documentador y Relator (grupo de un integrante) | ms-clientes, ms-envios |

## Microservicios

| Microservicio | Entidad | Responsable | Puerto | Atributos | Referencia a (id) |
|---|---|---|---|---|---|
| ms-usuarios | Usuario | Docente | 3001 | id, nombre, email, rol, activo | — |
| ms-clientes | Cliente | Hernán David Gutiérrez | 3002 | id, nombre, nit, email, telefono, ciudad, direccion, activo | — |
| ms-envios | Envío | Hernán David Gutiérrez | 3003 | id, numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro | cliente_id → ms-clientes |

Roles de la empresa: `administrador`, `despacho`, `flota`.

## Estructura

```
├── README.md
├── ms-usuarios/     ← entregado por la docente (no se modifica)
├── ms-clientes/     ← Taller 1 y 2
├── ms-envios/       ← Taller 1 y 2
├── postman/         ← colección de pruebas
├── frontend/        ← interfaz web (desde la semana 2)
└── deploy/          ← archivos de despliegue (Taller 3)
```

## Cómo ejecutar un microservicio

```
cd ms-clientes
npm install
copy .env.example .env
npm run dev
```

Requisitos: Node.js LTS 22.9 o superior. No se suben `node_modules/` ni `.env`.
