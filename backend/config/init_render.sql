-- Script de inicialización para Render PostgreSQL
-- Ejecutar manualmente desde el dashboard de Render o usando psql

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL -- 'admin' o 'cobrador'
);

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    direccion VARCHAR(100) NOT NULL
);

-- Tabla de prestamos
CREATE TABLE IF NOT EXISTS prestamos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    plan VARCHAR(50) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL -- 'activo', 'vencido', 'pagado', 'moroso'
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER REFERENCES prestamos(id),
    fecha_pago DATE NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    cobrador_id INTEGER REFERENCES usuarios(id)
);

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

-- Índices para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion);
