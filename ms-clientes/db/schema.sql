-- =====================================================================
-- ms-clientes · estructura de la tabla y registros iniciales
-- Ejecutar conectado como clientes_user sobre la base clientes_db:
--   mysql -u clientes_user -p clientes_db
--   mysql> SOURCE db/schema.sql;
-- =====================================================================
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

DROP TABLE IF EXISTS clientes;  -- permite volver a ejecutar el script desde cero

CREATE TABLE clientes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(120) NOT NULL,
  nit        VARCHAR(15)  NOT NULL UNIQUE,
  email      VARCHAR(120) NOT NULL,
  telefono   VARCHAR(10)  NOT NULL,
  ciudad     VARCHAR(60)  NOT NULL,
  direccion  VARCHAR(150) NOT NULL,
  activo     BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO clientes (nombre, nit, email, telefono, ciudad, direccion, activo) VALUES
  ('Distribuidora El Valle',    '900123456-7', 'compras@elvalle.com.co',         '6023456789', 'Cali',     'Calle 15 # 32-40',   TRUE),
  ('Textiles Antioquia S.A.S.', '901234567-1', 'logistica@textilesantioquia.co', '6044412233', 'Medellín', 'Carrera 50 # 10-25', TRUE),
  ('Ferretería La Sabana',      '830045678-2', 'pedidos@lasabana.com',           '6017654321', 'Bogotá',   'Avenida 68 # 22-15', FALSE);
