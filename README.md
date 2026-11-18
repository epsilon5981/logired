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
└── deploy/          ← app.conf, archivos .service y SQL de bases y usuarios (Taller 3)
```

## Cómo ejecutar todo en un PC

Requisitos: Node.js LTS 22.9 o superior y MySQL Server 8. Cada microservicio se arranca en su propia terminal siguiendo su README (crear la base con `db/schema.sql`, crear el `.env` con la misma `JWT_SECRET` y `npm run dev`). No se suben `node_modules/` ni `.env`.

## Despliegue en el ambiente del Módulo 2 (Taller 3)

La aplicación se despliega en las dos VMs del Módulo 2 y se abre desde Windows en **http://app.logired.com**.

| Componente | Equipo | IP | Puerto | Servicio / base de datos | Accesible desde |
|---|---|---|---|---|---|
| DNS (bind9) | servidor1 | 172.16.0.178 | 53 | bind9 | red del laboratorio |
| MySQL | servidor1 | 172.16.0.178 | 3306 | mysql | solo servidor2 |
| Apache (gateway + frontend) | servidor2 | 172.16.0.179 | 80 | apache2 | red del laboratorio |
| ms-usuarios | servidor2 | 127.0.0.1 | 3001 | ms-usuarios / usuarios_db | solo servidor2 |
| ms-clientes | servidor2 | 127.0.0.1 | 3002 | ms-clientes / clientes_db | solo servidor2 |
| ms-envios | servidor2 | 127.0.0.1 | 3003 | ms-envios / envios_db | solo servidor2 |

### 1. servidor1: MySQL

```
sudo apt update && sudo apt install -y mysql-server
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
#   bind-address = 127.0.0.1,172.16.0.178
sudo systemctl restart mysql
sudo ufw allow from 172.16.0.179 to any port 3306 proto tcp
sudo mysql        # ejecutar deploy/bases-de-datos.sql con contraseñas nuevas
```

### 2. servidor1: registro DNS

En la zona directa de `logired.com`: `app IN A 172.16.0.179`, incrementar el serial, `named-checkzone` y `sudo systemctl restart bind9`.

### 3. servidor2: Node.js, código y usuario del servicio

```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git mysql-client
sudo adduser --system --group --no-create-home nodeapps
sudo mkdir -p /srv/logired/app && sudo chown vagrant:vagrant /srv/logired/app
git clone https://github.com/epsilon5981/logired.git /srv/logired/app
```

### 4. servidor2: cada microservicio (primero ms-usuarios)

```
cd /srv/logired/app/ms-<recurso>
npm ci --omit=dev
mysql -h 172.16.0.178 -u <recurso>_user -p <recurso>_db < db/schema.sql
cp .env.example .env && nano .env        # DB_HOST=172.16.0.178, clave nueva, JWT_SECRET de producción
chmod 640 .env && sudo chgrp nodeapps .env
sudo cp ../deploy/ms-<recurso>.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now ms-<recurso>
curl http://127.0.0.1:300X/health
```

La `JWT_SECRET` debe ser la misma en los tres `.env` de servidor2.

### 5. servidor2: gateway y frontend

```
sudo a2enmod proxy proxy_http
sudo mkdir -p /var/www/app
sudo cp /srv/logired/app/frontend/* -r /var/www/app/
sudo cp /srv/logired/app/deploy/app.conf /etc/apache2/sites-available/
sudo a2ensite app.conf && sudo apache2ctl configtest && sudo systemctl reload apache2
```

En servidor2 solo deben estar abiertos 22/tcp y 80/tcp en ufw: los puertos 3001 a 3003 no se abren.

### Actualizar un microservicio

```
cd /srv/logired/app && git pull
cd ms-<recurso> && npm ci --omit=dev && sudo systemctl restart ms-<recurso>
```
