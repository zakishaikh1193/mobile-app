const mysql = require('mysql2/promise');
require('dotenv').config();

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    // Check if admin user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@kodeit.com']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      console.log('Email: admin@kodeit.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await connection.execute(
      'INSERT INTO users (username, email, password, role, first_name, last_name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      ['admin', 'admin@kodeit.com', hashedPassword, 'admin', 'Admin', 'User', 1]
    );

    console.log('Admin user created successfully!');
    console.log('Email: admin@kodeit.com');
    console.log('Password: admin123');
    console.log('Role: admin');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await connection.end();
  }
}

createAdminUser();
