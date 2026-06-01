# Sistema de Préstamos

Sistema web para la gestión y cobranza de préstamos.

## Descripción

Esta aplicación permite administrar clientes, préstamos y pagos, facilitando el seguimiento de vencimientos y el control de morosos.

## Funcionalidades

* Alta, baja y modificación de clientes.
* Registro de préstamos.
* Registro de pagos.
* Consulta de préstamos vigentes.
* Visualización de préstamos vencidos.
* Gestión de usuarios administradores.
* Gestión de usuarios cobradores.
* Panel de administración.
* Panel de cobranzas.

## Tecnologías utilizadas

### Frontend

* React
* TypeScript

### Backend

* Node.js
* Express

### Base de Datos

* PostgreSQL

## Estructura del proyecto

```text
web-prestamos/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
├── frontend/
│   ├── src/
│   └── public/
│
├── .gitignore
└── README.md
```

## Instalación

### Clonar repositorio

```bash
git clone https://github.com/seba14558/sistema-prestamos.git
cd sistema-prestamos
```

### Backend

```bash
cd backend
npm install
# Opcional: copia backend/.env.example a backend/.env y ajusta tus credenciales
npm run dev
```

Variables usadas por el backend:

* `PORT`
* `PGHOST`
* `PGPORT`
* `PGDATABASE`
* `PGUSER`
* `PGPASSWORD`
* `JWT_SECRET`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Ejecución del proyecto

1. Iniciar el backend:

```bash
cd backend
npm run dev
```

2. Iniciar el frontend en otra terminal:

```bash
cd frontend
npm run dev
```

El backend usa el archivo `backend/.env` para leer la configuración de PostgreSQL y el secreto JWT.

## Autor

Sebastián Noguera
