const pool = require('../config/db');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Iniciando migración para agregar cobrador_id a prestamos...');

    // Verificar si la columna ya existe
    const checkColumn = await client.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'prestamos'
      AND column_name = 'cobrador_id'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('La columna cobrador_id ya existe en la tabla prestamos.');
      return;
    }

    // Agregar campo cobrador_id
    await client.query(`
      ALTER TABLE prestamos ADD COLUMN cobrador_id INTEGER REFERENCES usuarios(id)
    `);
    console.log('✓ Columna cobrador_id agregada a la tabla prestamos');

    // Crear índice
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_prestamos_cobrador_id ON prestamos(cobrador_id)
    `);
    console.log('✓ Índice idx_prestamos_cobrador_id creado');

    console.log('Migración completada exitosamente!');
  } catch (err) {
    console.error('Error durante la migración:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => {
    console.log('Script finalizado correctamente');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Script falló:', err);
    process.exit(1);
  });
