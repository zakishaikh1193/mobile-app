const mysql = require('mysql2/promise');
require('dotenv').config();

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['test@test.com']
    );

    if (existingUsers.length > 0) {
      console.log('Test user already exists');
      return;
    }

    // Create test user
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('test123', 10);

    await connection.execute(
      'INSERT INTO users (username, email, password, role, firstName, lastName, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
      ['testuser', 'test@test.com', hashedPassword, 'parent', 'Test', 'User', 'active']
    );

    console.log('Test user created successfully!');
    console.log('Email: test@test.com');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await connection.end();
  }
}

createTestUser();
