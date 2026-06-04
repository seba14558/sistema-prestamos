// Cron job para verificar préstamos por vencer
const cron = require('node-cron');
const pool = require('../config/db');

// Verificar préstamos que vencen en los próximos 3 días
async function checkDueLoans() {
  try {
    console.log('Verificando préstamos por vencer...');
    
    // Buscar préstamos que vencen en los próximos 3 días y que aún no tienen notificación
    const result = await pool.query(`
      SELECT p.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido
      FROM prestamos p
      JOIN clientes c ON p.cliente_id = c.id
      WHERE p.estado = 'activo'
      AND p.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones n 
        WHERE n.prestamo_id = p.id 
        AND n.tipo = 'vencimiento_prestamo'
        AND n.fecha_creacion > CURRENT_DATE
      )
    `);

    const loans = result.rows;

    if (loans.length > 0) {
      console.log(`Encontrados ${loans.length} préstamos por vencer`);

      // Obtener todos los usuarios cobradores y admin para enviar notificaciones
      const usersResult = await pool.query(`
        SELECT id FROM usuarios WHERE rol IN ('cobrador', 'admin')
      `);
      const users = usersResult.rows;

      // Crear notificaciones para cada usuario
      for (const loan of loans) {
        const daysUntilDue = Math.ceil((new Date(loan.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
        const message = `El préstamo #${loan.id} del cliente ${loan.cliente_nombre} ${loan.cliente_apellido} vence en ${daysUntilDue} días (${new Date(loan.fecha_vencimiento).toLocaleDateString('es-AR')}). Monto: $${Number(loan.monto).toLocaleString('es-AR')}`;

        for (const user of users) {
          await pool.query(`
            INSERT INTO notificaciones (usuario_id, tipo, titulo, mensaje, prestamo_id, cliente_id)
            VALUES ($1, 'vencimiento_prestamo', 'Préstamo por vencer', $2, $3, $4)
          `, [user.id, message, loan.id, loan.cliente_id]);
        }
      }

      console.log('Notificaciones creadas exitosamente');
    } else {
      console.log('No hay préstamos por vencer en los próximos 3 días');
    }
  } catch (err) {
    console.error('Error al verificar préstamos por vencer:', err);
  }
}

// Ejecutar todos los días a las 8:00 AM
cron.schedule('0 8 * * *', checkDueLoans);

console.log('Cron job configurado: Verificación de préstamos por vencer a las 8:00 AM');

// Ejecutar inmediatamente para pruebas (opcional)
// checkDueLoans();
