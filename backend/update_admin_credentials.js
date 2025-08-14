const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateAdminCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    // New admin credentials
    const newEmail = 'newadmin@kodeit.com';
    const newPassword = 'newadmin123';
    const newUsername = 'newadmin';

    // Check if admin user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE role = ?',
      ['admin']
    );

    if (existingUsers.length === 0) {
      console.log('No admin user found. Creating new admin user...');
      
      // Create new admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await connection.execute(
        'INSERT INTO users (username, email, password, role, first_name, last_name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [newUsername, newEmail, hashedPassword, 'admin', 'Admin', 'User', 1]
      );

      console.log('New admin user created successfully!');
    } else {
      console.log('Updating existing admin user...');
      
      // Update existing admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await connection.execute(
        'UPDATE users SET username = ?, email = ?, password = ?, updated_at = NOW() WHERE role = ?',
        [newUsername, newEmail, hashedPassword, 'admin']
      );

      console.log('Admin user updated successfully!');
    }

    console.log('=== NEW ADMIN CREDENTIALS ===');
    console.log('Email:', newEmail);
    console.log('Password:', newPassword);
    console.log('Username:', newUsername);
    console.log('Role: admin');
    console.log('=============================');

  } catch (error) {
    console.error('Error updating admin credentials:', error);
  } finally {
    await connection.end();
  }
}

updateAdminCredentials();
