-- Script para crear la base de datos y tablas iniciales para la app de préstamos

-- Crear base de datos
CREATE DATABASE prestamos_db;

-- Conectarse a la base de datos
\c prestamos_db;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL -- 'admin' o 'cobrador'
);

-- Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    direccion VARCHAR(100) NOT NULL
);

-- Tabla de prestamos
CREATE TABLE prestamos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id),
    plan VARCHAR(50) NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_vencimiento DATE NOT NULL,
    estado VARCHAR(20) NOT NULL -- 'activo', 'vencido', 'pagado', 'moroso'
);

-- Tabla de pagos
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER REFERENCES prestamos(id),
    fecha_pago DATE NOT NULL,
    monto NUMERIC(12,2) NOT NULL,
    cobrador_id INTEGER REFERENCES usuarios(id)
);