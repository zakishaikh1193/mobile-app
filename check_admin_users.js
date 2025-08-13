const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdminUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    const [users] = await connection.execute('SELECT id, username, email, role, first_name, last_name FROM users WHERE role = "admin"');
    console.log('Admin users in database:');
    users.forEach(user => {
      console.log(`ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Name: ${user.first_name} ${user.last_name}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkAdminUsers();
