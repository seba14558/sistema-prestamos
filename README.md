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

* MySQL

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
npm start
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Autor

Sebastián Noguera
