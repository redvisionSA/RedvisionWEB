-- Base D1 de la tienda (binding `DB` del proyecto Pages redvision-web).
-- Crear una sola vez:
--   npx wrangler d1 create redvision-web
--   npx wrangler d1 execute redvision-web --remote --file docs/popularidad.sql
-- y vincularla en Pages -> Settings -> Bindings -> D1 database: nombre `DB`.
CREATE TABLE IF NOT EXISTS eventos (
  dia      TEXT NOT NULL,  -- AAAA-MM-DD, hora de Argentina
  producto TEXT NOT NULL,  -- id del producto en el ERP
  tipo     TEXT NOT NULL,  -- busqueda | carrito | pedido
  origen   TEXT NOT NULL,  -- hash del visitante del dia (no permite recuperar la IP)
  PRIMARY KEY (dia, producto, tipo, origen)
);
CREATE INDEX IF NOT EXISTS eventos_dia ON eventos (dia);
