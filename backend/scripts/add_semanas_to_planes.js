const pool = require('../config/db');

async function addSemanasToPlanes() {
  let client;
  try {
    console.log('Iniciando migración de planes semanales...');
    client = await pool.connect();
    console.log('✓ Conectado a la base de datos');

    // Agregar campos para manejar planes semanales
    await client.query(`
      ALTER TABLE planes ADD COLUMN IF NOT EXISTS semanas INTEGER DEFAULT 0
    `);
    console.log('✓ Columna "semanas" agregada');

    await client.query(`
      ALTER TABLE planes ADD COLUMN IF NOT EXISTS tipo_plan VARCHAR(20) DEFAULT 'dias'
    `);
    console.log('✓ Columna "tipo_plan" agregada');

    // Actualizar planes existentes para que tengan tipo_plan = 'dias'
    await client.query(`
      UPDATE planes SET tipo_plan = 'dias' WHERE tipo_plan IS NULL
    `);
    console.log('✓ Planes existentes actualizados a tipo_plan = "dias"');

    // Insertar planes semanales predeterminados (4 semanas 30%, 6 semanas 40%, 8 semanas 50%)
    const planesToInsert = [
      { nombre: '4 semanas', dias: 28, porcentaje: 30.00, semanas: 4 },
      { nombre: '6 semanas', dias: 42, porcentaje: 40.00, semanas: 6 },
      { nombre: '8 semanas', dias: 56, porcentaje: 50.00, semanas: 8 }
    ];

    for (const plan of planesToInsert) {
      try {
        await client.query(
          `INSERT INTO planes (nombre, dias, porcentaje_interes, activo, semanas, tipo_plan)
           VALUES ($1, $2, $3, true, $4, 'semanas')
           ON CONFLICT (nombre) DO NOTHING`,
          [plan.nombre, plan.dias, plan.porcentaje, plan.semanas]
        );
        console.log(`✓ Plan "${plan.nombre}" insertado correctamente`);
      } catch (err) {
        if (err.code !== '23505') { // 23505 = unique_violation
          console.error(`✗ Error al insertar plan "${plan.nombre}":`, err.message);
        } else {
          console.log(`- Plan "${plan.nombre}" ya existe, omitiendo`);
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\nPlanes semanales disponibles:');
    const result = await client.query("SELECT nombre, dias, porcentaje_interes, semanas, tipo_plan FROM planes WHERE tipo_plan = 'semanas' ORDER BY semanas");
    result.rows.forEach(plan => {
      console.log(`  - ${plan.nombre}: ${plan.semanas} semanas (${plan.dias} días) - ${plan.porcentaje_interes}% interés`);
    });

  } catch (err) {
    console.error('❌ Error durante la migración:', err);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

addSemanasToPlanes().catch(err => {
  console.error('Error no capturado:', err);
  process.exit(1);
});
