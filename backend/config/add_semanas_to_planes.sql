-- Agregar campos para manejar planes semanales
ALTER TABLE planes ADD COLUMN IF NOT EXISTS semanas INTEGER DEFAULT 0;
ALTER TABLE planes ADD COLUMN IF NOT EXISTS tipo_plan VARCHAR(20) DEFAULT 'dias'; -- 'dias' o 'semanas'

-- Actualizar planes existentes para que tengan tipo_plan = 'dias'
UPDATE planes SET tipo_plan = 'dias' WHERE tipo_plan IS NULL;

-- Insertar planes semanales predeterminados (4 semanas 30%, 6 semanas 40%, 8 semanas 50%)
INSERT INTO planes (nombre, dias, porcentaje_interes, activo, semanas, tipo_plan) VALUES
('4 semanas', 28, 30.00, true, 4, 'semanas'),
('6 semanas', 42, 40.00, true, 6, 'semanas'),
('8 semanas', 56, 50.00, true, 8, 'semanas')
ON CONFLICT (nombre) DO NOTHING;
