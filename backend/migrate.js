const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected. Running migrations...');

    // 1. Create clubs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100)
      );
    `);
    console.log('Clubs table checked/created.');

    // 2. Modify users table to add club_id, if not exists
    const [columns] = await connection.query(`SHOW COLUMNS FROM users LIKE 'club_id'`);
    if (columns.length === 0) {
      await connection.query(`ALTER TABLE users ADD COLUMN club_id INT NULL`);
      console.log('Added club_id to users table.');
    } else {
      console.log('club_id already exists in users table.');
    }

    await connection.end();
    console.log('Migrations complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
