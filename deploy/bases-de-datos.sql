-- =====================================================================
-- Bases de datos y usuarios de LogiRed en servidor1 (MySQL)
-- Ejecutar en servidor1 con: sudo mysql
-- Cada usuario solo puede conectarse desde servidor2 (172.16.0.179).
-- Reemplace <clave-...> por contraseñas de solo letras y números.
-- Las contraseñas reales NO se suben al repositorio.
-- =====================================================================
CREATE DATABASE usuarios_db;
CREATE USER 'usuarios_user'@'172.16.0.179' IDENTIFIED BY '<clave-usuarios>';
GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'172.16.0.179';

CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'172.16.0.179' IDENTIFIED BY '<clave-clientes>';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'172.16.0.179';

CREATE DATABASE envios_db;
CREATE USER 'envios_user'@'172.16.0.179' IDENTIFIED BY '<clave-envios>';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'172.16.0.179';

-- Las tablas se crean DESDE servidor2, con el schema.sql de cada microservicio:
--   mysql -h 172.16.0.178 -u usuarios_user -p usuarios_db < db/schema.sql   (en ms-usuarios)
--   mysql -h 172.16.0.178 -u clientes_user -p clientes_db < db/schema.sql   (en ms-clientes)
--   mysql -h 172.16.0.178 -u envios_user   -p envios_db   < db/schema.sql   (en ms-envios)
