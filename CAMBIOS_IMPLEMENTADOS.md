# Cambios Implementados - Sistema de Préstamos

## Resumen de Funcionalidades Agregadas

Se han implementado las siguientes funcionalidades solicitadas:

### 5. **Campo de Teléfono en Clientes**
- Agregado campo opcional de número de teléfono al registro de clientes
- El teléfono se muestra en la tabla de clientes con icono
- Se puede buscar clientes por número de teléfono
- El campo es opcional, permitiendo clientes sin teléfono registrado

### 6. **Cálculo de Días Excluyendo Domingos**
- Al calcular la fecha de vencimiento de un préstamo, ahora se excluyen los domingos
- Los días se cuentan solo de lunes a sábado (días hábiles para cobros)
- Si un préstamo es de 30 días, el sistema buscará la fecha que sea 30 días hábiles después de la fecha de inicio
- Ejemplo: Si inicio es lunes y son 7 días, el vencimiento será el próximo martes (no se cuenta el domingo intermedio)

### 1. **Edición Manual de Porcentajes**
- Los administradores pueden ahora editar manualmente el porcentaje de interés al crear o editar préstamos
- Se agregó un toggle "Editar porcentaje manualmente" en el formulario de préstamos
- El cálculo del monto total se actualiza dinámicamente según el porcentaje personalizado

### 2. **Asignación de Préstamos a Cobradores**
- Se agregó un campo `cobrador_id` a la tabla `prestamos` en la base de datos
- Los administradores pueden asignar un cobrador específico a cada préstamo
- Se muestra el nombre del cobrador asignado en la tabla de préstamos

### 3. **Vista de Cobradores - Solo sus Clientes Asignados**
- Los cobradores solo pueden ver los préstamos que les han sido asignados
- Los cobradores solo pueden ver los clientes que tienen préstamos asignados
- Filtros automáticos aplicados en todas las consultas de préstamos y clientes

### 4. **Autorización para Registro de Cobros**
- Los cobradores solo pueden registrar pagos en préstamos que les han sido asignados
- Validación en el backend para asegurar que un cobrador no pueda registrar pagos en préstamos de otros cobradores
- Los administradores pueden registrar pagos en cualquier préstamo

## Cambios en la Base de Datos

### Archivo: `backend/config/add_cobrador_to_prestamos.sql`
```sql
-- Agregar campo cobrador_id a la tabla prestamos
ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS cobrador_id INTEGER REFERENCES usuarios(id);

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_prestamos_cobrador_id ON prestamos(cobrador_id);
```

### Migración Automática
- La migración se ejecuta automáticamente al iniciar el servidor en `backend/index.js`
- No requiere ejecución manual de scripts SQL

## Cambios en el Backend

### Controllers Modificados:

1. **`prestamosController.js`**
   - `crearPrestamo`: Ahora acepta y guarda `cobrador_id`
   - `editarPrestamo`: Permite editar `cobrador_id`
   - `listarPrestamos`: Filtra préstamos según el rol del usuario (admin ve todos, cobrador solo los suyos)
   - `prestamosVencidos`: Filtra según el rol del usuario
   - `prestamosProximosAVencer`: Filtra según el rol del usuario
   - Todos los endpoints ahora incluyen el nombre del cobrador en las respuestas

2. **`clientesController.js`**
   - `listarClientes`: Los cobradores solo ven clientes que tienen préstamos asignados a ellos

3. **`pagosController.js`**
   - `registrarPago`: Validación para asegurar que el cobrador solo registre pagos en sus préstamos asignados
   - Los administradores pueden registrar pagos en cualquier préstamo

4. **`usuariosController.js`**
   - Nuevo endpoint: `obtenerCobradores` - Devuelve lista de usuarios con rol 'cobrador'

### Rutas Modificadas:

1. **`routes/usuarios.js`**
   - Agregada ruta `GET /api/usuarios/cobradores` para obtener solo cobradores

## Cambios en el Frontend

### `frontend/src/pages/admin/LoansPage.tsx`

1. **Nuevas Interfaces TypeScript**
   - `Collector`: Para representar usuarios cobradores
   - `Loan`: Agregados campos `cobrador_id` y `cobrador_nombre`

2. **Nuevos Estados**
   - `collectors`: Lista de cobradores disponibles
   - `cobradorId`: ID del cobrador seleccionado
   - `editPercentage`: Toggle para editar porcentaje manualmente
   - `customPercentage`: Porcentaje personalizado ingresado

3. **Funcionalidades Agregadas**
   - Carga de cobradores desde la API al iniciar
   - Selector de cobrador en el formulario de préstamos
   - Toggle para activar/desactivar edición manual de porcentaje
   - Campo de entrada para porcentaje personalizado
   - Cálculo dinámico del monto total según el porcentaje personalizado
   - Columna adicional en la tabla para mostrar el cobrador asignado
   - Envío de `cobrador_id` al crear/editar préstamos

4. **Mejoras UI**
   - Modal expandido de `maxWidth="sm"` a `maxWidth="md"` para acomodar nuevos campos
   - Indicadores visuales (Chips) para mostrar cobradores asignados
   - Etiqueta "Sin asignar" para préstamos sin cobrador

## Flujo de Trabajo

### Para Administradores:
1. Al crear un préstamo, pueden:
   - Seleccionar un cliente
   - Elegir un plan o editar el porcentaje manualmente
   - Asignar un cobrador específico
   - El monto total se calcula automáticamente

2. Al editar un préstamo, pueden:
   - Modificar cualquier campo
   - Cambiar el cobrador asignado
   - Ajustar el porcentaje manualmente

### Para Cobradores:
1. Solo ven préstamos que les han sido asignados
2. Solo ven clientes que tienen préstamos asignados a ellos
3. Solo pueden registrar pagos en sus préstamos asignados
4. Intentar registrar pagos en préstamos de otros cobradores resulta en error 403

## Seguridad

- Todas las validaciones se realizan en el backend
- El frontend solo implementa la interfaz, no la lógica de seguridad
- Los roles se verifican en cada endpoint sensible
- Referencias de integridad en la base de datos para `cobrador_id`

## Pruebas Recomendadas

1. **Crear préstamo con cobrador asignado**
   - Verificar que el cobrador aparece en la tabla
   - Verificar que el cobrador puede ver el préstamo

2. **Editar porcentaje manualmente**
   - Activar el toggle de edición manual
   - Ingresar un porcentaje diferente
   - Verificar que el monto total se recalcula correctamente

3. **Verificar permisos de cobrador**
   - Iniciar sesión como cobrador
   - Verificar que solo ve sus préstamos asignados
   - Intentar registrar pago en préstamo no asignado (debe fallar)

4. **Verificar permisos de admin**
   - Verificar que el admin ve todos los préstamos
   - Verificar que el admin puede registrar pagos en cualquier préstamo

## Archivos Modificados

### Backend:
- `backend/index.js` - Migración automática de cobrador_id
- `backend/config/add_cobrador_to_prestamos.sql` - Script SQL (opcional)
- `backend/controllers/prestamosController.js`
- `backend/controllers/clientesController.js`
- `backend/controllers/pagosController.js`
- `backend/controllers/usuariosController.js`
- `backend/routes/usuarios.js`

### Frontend:
- `frontend/src/pages/admin/LoansPage.tsx`
- `frontend/src/pages/admin/ClientsPage.tsx`

## Nuevos Cambios - Campo de Teléfono en Clientes

### Cambios en la Base de Datos

### Archivo: `backend/index.js`
```javascript
// Agregar columna telefono a la tabla clientes
await pool.query(`
  ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)
`);
```

### Cambios en el Backend

### Controllers Modificados:

1. **`clientesController.js`**
   - `crearCliente`: Ahora acepta y guarda `telefono` (opcional)
   - `editarCliente`: Permite editar `telefono` (opcional)

### Cambios en el Frontend

### `frontend/src/pages/admin/ClientsPage.tsx`

1. **Interfaz TypeScript**
   - `Client`: Agregado campo opcional `telefono`

2. **Nuevos Estados**
   - `telefono`: Número de teléfono del cliente

3. **Funcionalidades Agregadas**
   - Campo de entrada para teléfono en el formulario (opcional)
   - Columna adicional en la tabla para mostrar el teléfono
   - Icono de teléfono en la visualización
   - Búsqueda por número de teléfono
   - Etiqueta "No registrado" para clientes sin teléfono

4. **Mejoras UI**
   - Icono `Phone` importado de Material-UI
   - Visualización con icono y número de teléfono
   - Campo marcado como opcional con helper text

## Notas Importantes

- La migración de la base de datos se ejecuta automáticamente al iniciar el servidor
- No se requiere intervención manual en la base de datos
- Los préstamos existentes tendrán `cobrador_id = NULL` hasta que se les asigne un cobrador
- El sistema es retrocompatible con préstamos sin cobrador asignado
