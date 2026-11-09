-- =====================================================================
-- ms-envios · estructura de la tabla y registros iniciales
-- Ejecutar conectado como envios_user sobre la base envios_db:
--   mysql -u envios_user -p envios_db
--   mysql> SOURCE db/schema.sql;
--
-- cliente_id NO tiene FOREIGN KEY: la tabla clientes vive en otra base de
-- datos (clientes_db), de otro microservicio. Que el cliente exista lo
-- valida ms-envios consultando a ms-clientes por REST.
-- =====================================================================
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

DROP TABLE IF EXISTS envios;  -- permite volver a ejecutar el script desde cero

CREATE TABLE envios (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  numero_guia        VARCHAR(20)   NOT NULL UNIQUE,
  cliente_id         INT           NOT NULL,
  peso_kg            DECIMAL(8,2)  NOT NULL,
  ciudad_destino     VARCHAR(60)   NOT NULL,
  direccion_destino  VARCHAR(150)  NOT NULL,
  estado             VARCHAR(20)   NOT NULL DEFAULT 'registrado',
  fecha_registro     DATE          NOT NULL
);

INSERT INTO envios (numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro) VALUES
  ('LR-2026-000001', 1,  12.50, 'Medellín', 'Carrera 43A # 1-50', 'entregado',   '2026-10-20'),
  ('LR-2026-000002', 2, 340.00, 'Bogotá',   'Calle 80 # 69-70',   'en_transito', '2026-10-28'),
  ('LR-2026-000003', 1,   2.50, 'Cali',     'Avenida 6N # 23-45', 'registrado',  '2026-11-03');
