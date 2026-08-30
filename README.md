# Sistema de Préstamos "Nueva Opción"

Sistema web completo para la gestión y cobranza de préstamos con panel de administración diferenciado para administradores y cobradores.

## Descripción

Esta aplicación permite administrar clientes, préstamos y pagos, facilitando el seguimiento de vencimientos y el control de morosos. Cuenta con un sistema de roles (administrador/cobrador), dashboard financiero en tiempo real, alertas de vencimientos y gestión completa de usuarios.

## Funcionalidades

### Gestión de Clientes
- Alta, edición y eliminación de clientes
- Búsqueda en tiempo real por nombre, apellido, dirección
- Validación: no permite eliminar clientes con préstamos activos
- Interfaz moderna con tablas interactivas

### Gestión de Préstamos
- Planes de 30, 40 y 50 días con cálculo automático de intereses (30%, 35%, 40%)
- Cálculo automático de fecha de vencimiento y monto total
- Estados: activo, vencido, pagado, moroso
- Búsqueda y filtrado en tiempo real
- Edición de préstamos (solo administradores)

### Sistema de Pagos
- Registro de cobros por cobradores en campo
- Historial de recaudación (personal para cobradores, total para admin)
- Edición y eliminación de pagos (solo admin)
- Actualización automática de estado de préstamo a "pagado" cuando se completa el pago
- Sistema de confirmación para operaciones críticas

### Gestión de Usuarios
- Creación de usuarios (admin y cobradores)
- Edición de usuarios con/sin cambio de contraseña
- Eliminación de usuarios con protecciones de seguridad
- Autenticación JWT con roles diferenciados
- Control de acceso por rol

### Dashboard Financiero
- Capital prestado total
- Total recaudado
- Saldo en calle (pendiente de cobro)
- Cantidad de préstamos por estado (activos, vencidos, pagados, morosos)
- Porcentaje de recuperación de capital
- KPIs en tiempo real con gráficos visuales

### Sistema de Notificaciones
- Campana de notificaciones en tiempo real
- Alertas de vencimientos y morosos
- Panel de gestión de notificaciones

### Control de Morosos
- Lista de préstamos vencidos y morosos
- Cálculo de días de atraso
- Dirección de cobro para organizar rutas de visita
- Búsqueda y filtrado de morosos

### Alertas de Vencimientos
- Préstamos próximos a vencer (próximos 3 días)
- Vencimientos históricos pendientes
- Navegación directa al formulario de cobro
- Cálculo de días restantes o de retraso

### Panel de Administrador (7 pantallas)
1. **Dashboard** - Panel de control financiero con KPIs en tiempo real
2. **Clientes** - Gestión completa de clientes (CRUD + búsqueda)
3. **Préstamos** - Gestión de préstamos con cálculo automático de intereses
4. **Cobros** - Gestión de recaudación y pagos
5. **Usuarios** - Gestión de usuarios del sistema
6. **Deudores Morosos** - Control de clientes en mora
7. **Próximos Vencimientos** - Alertas de vencimientos próximos

### Panel de Cobrador (3 pantallas)
1. **Registro de Cobros** - Formulario para registrar pagos en la calle
2. **Deudores Morosos** - Lista de clientes para visitas
3. **Próximos Vencimientos** - Préstamos por cobrar en los próximos 3 días

### Autenticación
- Sistema de login seguro con JWT
- Roles diferenciados (admin/cobrador)
- Protección de rutas por rol
- Sesión persistente

## Tecnologías utilizadas

### Frontend
- React 18.3.1
- TypeScript 4.9.5
- Material UI 5.16.14 (biblioteca de componentes)
- React Router 6.28.0 (enrutamiento)
- Axios 1.16.1 (cliente HTTP)
- React Scripts 5.0.1 (build tool)
- Tailwind CSS 3.4.0 (estilos)
- @emotion/react y @emotion/styled (estilos dinámicos)

### Backend
- Node.js
- Express 5.2.1 (framework web)
- PostgreSQL 8.21.0 (cliente de base de datos)
- JWT 9.0.3 (autenticación)
- bcrypt 6.0.0 (encriptación de contraseñas)
- cors 2.8.6 (CORS)
- dotenv 17.4.2 (variables de entorno)
- node-cron 4.2.1 (tareas programadas)

### Base de Datos
- PostgreSQL 15 (base de datos relacional)
- Docker Compose para orquestación

### Infraestructura
- Docker & Docker Compose (contenedores)
- Sistema de autenticación JWT con roles
- API RESTful
- Arquitectura cliente-servidor

## Estructura del proyecto

```text
sistema-prestamos/
│
├── backend/
│   ├── controllers/          # Lógica de negocio
│   │   ├── authController.js
│   │   ├── clientesController.js
│   │   ├── pagosController.js
│   │   ├── prestamosController.js
│   │   ├── usuariosController.js
│   │   └── notificacionesController.js
│   ├── routes/              # Definición de rutas API
│   │   ├── auth.js
│   │   ├── clientes.js
│   │   ├── pagos.js
│   │   ├── prestamos.js
│   │   ├── usuarios.js
│   │   └── notificaciones.js
│   ├── middleware/          # Middleware de autenticación
│   │   └── authMiddleware.js
│   ├── config/              # Configuración de base de datos
│   │   ├── db.js
│   │   └── database.js
│   ├── cron/                # Tareas programadas
│   │   └── checkDueLoans.js
│   ├── index.js             # Punto de entrada del servidor
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   └── Toast.tsx
│   │   ├── pages/           # Páginas principales
│   │   │   ├── LoginPage.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   └── CollectorPanel.tsx
│   │   ├── pages/admin/     # Páginas de administrador
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ClientsPage.tsx
│   │   │   ├── LoansPage.tsx
│   │   │   ├── PaymentsPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── DebtorsPage.tsx
│   │   │   └── DueLoansPage.tsx
│   │   ├── pages/collector/ # Páginas de cobrador
│   │   │   ├── CollectionPage.tsx
│   │   │   ├── DebtorsPage.tsx
│   │   │   └── DueLoansPage.tsx
│   │   ├── services/        # Servicios API
│   │   │   └── api.ts
│   │   ├── App.tsx          # Componente principal
│   │   └── index.tsx        # Punto de entrada
│   └── package.json
│
├── docker-compose.yml       # Configuración Docker
└── README.md
```

## Instalación

### Requisitos previos
- Docker y Docker Compose
- Node.js 18+ (si no se usa Docker)
- PostgreSQL 15+ (si no se usa Docker)

### Opción 1: Usando Docker (Recomendado)

```bash
# Clonar repositorio
git clone https://github.com/seba14558/sistema-prestamos.git
cd sistema-prestamos

# Iniciar todos los servicios (postgres, backend, frontend)
docker-compose up --build

# Los servicios estarán disponibles en:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001/api
# Base de datos: localhost:5432
```

### Opción 2: Instalación manual (Desarrollo)

#### Clonar repositorio

```bash
git clone https://github.com/seba14558/sistema-prestamos.git
cd sistema-prestamos
```

#### Backend

```bash
cd backend
npm install
# Configurar variables de entorno en backend/.env
npm run dev
```

Variables usadas por el backend:

* `PORT` (por defecto: 3001)
* `PGHOST` (host de PostgreSQL)
* `PGPORT` (puerto de PostgreSQL, por defecto: 5432)
* `PGDATABASE` (nombre de la base de datos, por defecto: prestamos)
* `PGUSER` (usuario de PostgreSQL)
* `PGPASSWORD` (contraseña de PostgreSQL)
* `JWT_SECRET` (secreto para tokens JWT)

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend se ejecutará en `http://localhost:3000` por defecto.

## Ejecución del proyecto

### Con Docker (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up

# En modo detached (segundo plano)
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f
```

### Sin Docker (Desarrollo)

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

## URLs de Testing

### Entorno de Desarrollo Local
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001/api`
- **Base de Datos:** `localhost:5432`

### Endpoints API Principales

#### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (solo admin)

#### Clientes
- `GET /api/clientes` - Listar todos los clientes
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Editar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente (solo admin)

#### Préstamos
- `GET /api/prestamos` - Listar todos los préstamos
- `POST /api/prestamos` - Crear nuevo préstamo
- `PUT /api/prestamos/:id` - Editar préstamo (solo admin)
- `GET /api/prestamos/vencimientos` - Préstamos vencidos
- `GET /api/prestamos/proximos-vencer` - Préstamos próximos a vencer (3 días)

#### Pagos
- `POST /api/pagos` - Registrar pago
- `GET /api/pagos/recaudacion` - Ver recaudación
- `PUT /api/pagos/:id` - Editar pago (solo admin)
- `DELETE /api/pagos/:id` - Eliminar pago (solo admin)

#### Usuarios
- `GET /api/usuarios` - Listar usuarios (solo admin)
- `POST /api/usuarios` - Crear usuario (solo admin)
- `PUT /api/usuarios/:id` - Editar usuario (solo admin)
- `DELETE /api/usuarios/:id` - Eliminar usuario (solo admin)

#### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones
- `POST /api/notificaciones` - Crear notificación
- `PUT /api/notificaciones/:id/leer` - Marcar como leída

## Usuarios por Defecto

El sistema incluye scripts para crear usuarios iniciales:

```bash
cd backend
node crear_usuarios.js
```

Esto creará:
- Un usuario administrador
- Un usuario cobrador de prueba

## Configuración de Base de Datos

El sistema usa PostgreSQL con las siguientes tablas principales:
- `usuarios` - Usuarios del sistema
- `clientes` - Información de clientes
- `prestamos` - Préstamos activos
- `pagos` - Registro de pagos
- `notificaciones` - Sistema de notificaciones

## Características Técnicas Destacadas

### Seguridad
- Autenticación JWT con tokens seguros
- Encriptación de contraseñas con bcrypt
- Protección de rutas por roles
- Validación de datos en frontend y backend
- Protección contra eliminación de datos críticos

### Experiencia de Usuario
- Interfaz responsiva (móvil y escritorio)
- Carga skeletons para mejor percepción de rendimiento
- Toast notifications para feedback de acciones
- Dialogs de confirmación para operaciones críticas
- Búsqueda en tiempo real en todas las tablas
- Diseño moderno con gradientes y sombras

### Automatización
- Cálculo automático de intereses según plan
- Actualización automática de estado de préstamos pagados
- Tareas programadas (cron) para verificación de vencimientos
- Cálculo automático de fechas de vencimiento

### Validaciones
- No permite eliminar clientes con préstamos activos
- No permite eliminar usuarios que están autenticados
- Validación de montos positivos
- Validación de campos obligatorios
- Verificación de unicidad de nombres de usuario

## Características por Rol

### Administrador
- Acceso completo a todas las funcionalidades
- Gestión de usuarios y roles
- Edición y eliminación de préstamos
- Edición y eliminación de pagos
- Vista global de recaudación
- Dashboard financiero completo

### Cobrador
- Registro de pagos en campo
- Vista personal de recaudación
- Lista de morosos para visitas
- Alertas de vencimientos próximos
- Acceso limitado a edición de datos

## Resumen para Presupuesto

### Cantidad de Pantallas: 11
- 1 Login
- 7 Panel de Administrador
- 3 Panel de Cobrador

### Funcionalidades Principales: 15+
- Gestión completa de clientes (CRUD)
- Gestión de préstamos con cálculo de intereses
- Sistema de pagos y recaudación
- Dashboard financiero con KPIs
- Sistema de notificaciones
- Control de morosos y vencimientos
- Gestión de usuarios con roles
- Autenticación JWT
- API RESTful completa
- Base de datos PostgreSQL
- Docker Compose para despliegue
- Interfaz responsiva
- Búsqueda en tiempo real
- Validaciones de seguridad
- Tareas programadas

### Tecnologías Implementadas: 20+
- React + TypeScript
- Material UI
- Node.js + Express
- PostgreSQL
- JWT + bcrypt
- Docker + Docker Compose
- Axios
- React Router
- Node-cron
- Tailwind CSS

## Autor

Sebastián Noguera
