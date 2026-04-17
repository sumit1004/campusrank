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

    // 2.1 Add event_name to certificates table if not exists
    const [certCols] = await connection.query(`SHOW COLUMNS FROM certificates LIKE 'event_name'`);
    if (certCols.length === 0) {
      await connection.query(`ALTER TABLE certificates ADD COLUMN event_name VARCHAR(255) AFTER club_id`);
      console.log('Added event_name to certificates table.');
    } else {
      console.log('event_name already exists in certificates table.');
    }

    // 3. Create e_certificates table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS e_certificates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        club_id INT,
        event_name VARCHAR(255),
        event_date DATE,
        position ENUM('winner','runnerup1','runnerup2','participant'),
        certificate_url TEXT,
        points INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('e_certificates table checked/created.');

    // 4. Create certificate_batches table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS certificate_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        club_id INT,
        position ENUM('winner','runnerup1','runnerup2','participant'),
        event_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('certificate_batches table checked/created.');

    // 5. Create event_participation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS event_participation (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        club_id INT,
        event_name VARCHAR(255),
        event_date DATE,
        position ENUM('winner','runnerup1','runnerup2','participant'),
        source ENUM('manual','e_certificate'),
        points INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_event (user_id, club_id, event_name, event_date)
      );
    `);
    console.log('event_participation table checked/created.');

    await connection.end();
    console.log('Migrations complete.');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();
