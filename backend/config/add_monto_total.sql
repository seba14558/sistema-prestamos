-- Agregar campo monto_total a la tabla prestamos
ALTER TABLE prestamos ADD COLUMN monto_total NUMERIC(12,2);

-- Para préstamos existentes, establecer monto_total igual al monto (sin intereses por ahora)
UPDATE prestamos SET monto_total = monto WHERE monto_total IS NULL;
