-- Script para agregar campo cobrador_id a la tabla prestamos
-- Ejecutar en la base de datos prestamos_db

-- Agregar campo cobrador_id a la tabla prestamos
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS cobrador_id INTEGER REFERENCES usuarios(id);

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_prestamos_cobrador_id ON prestamos(cobrador_id);
