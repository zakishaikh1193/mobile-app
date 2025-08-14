const mysql = require('mysql2/promise');
require('dotenv').config();

// You can change these values to your preferred credentials
const NEW_ADMIN_CREDENTIALS = {
  email: 'admin@kodeit.com',      // Change this to your preferred email
  password: 'securepassword123',  // Change this to your preferred password
  username: 'admin',              // Change this to your preferred username
  firstName: 'Admin',
  lastName: 'User'
};

async function changeAdminCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('=== CHANGING ADMIN CREDENTIALS ===');
    console.log('New Email:', NEW_ADMIN_CREDENTIALS.email);
    console.log('New Username:', NEW_ADMIN_CREDENTIALS.username);
    console.log('New Password:', NEW_ADMIN_CREDENTIALS.password);
    console.log('===================================');

    // Check if admin user exists
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE role = ?',
      ['admin']
    );

    if (existingUsers.length === 0) {
      console.log('No admin user found. Creating new admin user...');
      
      // Create new admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(NEW_ADMIN_CREDENTIALS.password, 10);

      await connection.execute(
        'INSERT INTO users (username, email, password, role, first_name, last_name, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          NEW_ADMIN_CREDENTIALS.username, 
          NEW_ADMIN_CREDENTIALS.email, 
          hashedPassword, 
          'admin', 
          NEW_ADMIN_CREDENTIALS.firstName, 
          NEW_ADMIN_CREDENTIALS.lastName, 
          1
        ]
      );

      console.log('✅ New admin user created successfully!');
    } else {
      console.log('Updating existing admin user...');
      
      // Update existing admin user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(NEW_ADMIN_CREDENTIALS.password, 10);

      await connection.execute(
        'UPDATE users SET username = ?, email = ?, password = ?, first_name = ?, last_name = ?, updated_at = NOW() WHERE role = ?',
        [
          NEW_ADMIN_CREDENTIALS.username, 
          NEW_ADMIN_CREDENTIALS.email, 
          hashedPassword, 
          NEW_ADMIN_CREDENTIALS.firstName, 
          NEW_ADMIN_CREDENTIALS.lastName, 
          'admin'
        ]
      );

      console.log('✅ Admin user updated successfully!');
    }

    console.log('\n=== UPDATED ADMIN CREDENTIALS ===');
    console.log('Email:', NEW_ADMIN_CREDENTIALS.email);
    console.log('Password:', NEW_ADMIN_CREDENTIALS.password);
    console.log('Username:', NEW_ADMIN_CREDENTIALS.username);
    console.log('Role: admin');
    console.log('===================================');
    console.log('\nYou can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error updating admin credentials:', error);
  } finally {
    await connection.end();
  }
}

changeAdminCredentials();
