-- Script para agregar tabla de notificaciones
-- Ejecutar en la base de datos prestamos_db

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo VARCHAR(50) NOT NULL, -- 'vencimiento_prestamo', 'pago_vencido', 'nuevo_prestamo', etc.
    titulo VARCHAR(100) NOT NULL,
    mensaje TEXT NOT NULL,
    prestamo_id INTEGER REFERENCES prestamos(id),
    cliente_id INTEGER REFERENCES clientes(id),
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion);
