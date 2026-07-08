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

### Opción 1: Sin Docker

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

### Opción 2: Con Docker

Requisitos previos: Docker y Docker Compose instalados.

1. Levantar todos los servicios (PostgreSQL, backend y frontend):

```bash
docker-compose up --build
```

2. Para detener los servicios:

```bash
docker-compose down
```

3. Para detener los servicios y eliminar los volúmenes de datos:

```bash
docker-compose down -v
```

**Notas:**
- El frontend estará disponible en http://localhost:3001
- El backend estará disponible en http://localhost:3000
- PostgreSQL estará disponible en localhost:5432
- Los datos de PostgreSQL se persisten en un volumen de Docker
- Las variables de entorno están configuradas en docker-compose.yml

## Despliegue en Producción (Render)

### Requisitos previos
- Cuenta en [render.com](https://render.com)
- Repositorio en GitHub con el código del proyecto

### Pasos para desplegar

1. **Subir el código a GitHub:**
   ```bash
   git add .
   git commit -m "Agregar configuración para Render"
   git push origin main
   ```

2. **Crear cuenta en Render:**
   - Ve a [render.com](https://render.com)
   - Regístrate con tu cuenta de GitHub

3. **Crear nuevo servicio:**
   - En Render, haz clic en "New +"
   - Selecciona "Blueprint" (o usa el archivo `render.yaml`)
   - Conecta tu repositorio de GitHub
   - Render detectará automáticamente el archivo `render.yaml`

4. **Configuración automática:**
   El archivo `render.yaml` configura automáticamente:
   - Base de datos PostgreSQL
   - Backend API
   - Frontend (React con nginx)
   - Variables de entorno y conexiones entre servicios

5. **Despliegue:**
   - Render construirá y desplegará los servicios
   - Obtendrás URLs como:
     - Frontend: `https://sistema-prestamos-frontend.onrender.com`
     - Backend: `https://sistema-prestamos-backend.onrender.com`

6. **Crear usuarios iniciales:**
   Después del despliegue, ejecuta el script para crear usuarios:
   ```bash
   # Desde el shell del backend en Render
   node crear_usuarios.js
   ```

### Credenciales de acceso (testing)
- **Administrador:** usuario `admin`, contraseña `1234`
- **Cobrador:** usuario `cobrador`, contraseña `cobrador123`

**Nota:** Para producción, cambia estas contraseñas por defecto.

## Autor

Sebastián Noguera
