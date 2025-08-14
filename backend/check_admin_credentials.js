const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkAdminCredentials() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('🔍 Checking admin credentials in database...\n');

    // Check for admin users
    const [adminUsers] = await connection.execute(
      'SELECT id, username, email, role, first_name, last_name, is_active, created_at, updated_at FROM users WHERE role = ?',
      ['admin']
    );

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database!');
      console.log('You need to create an admin user first.');
      console.log('Run: node create_admin_user.js');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
      
      adminUsers.forEach((user, index) => {
        console.log(`--- Admin User ${index + 1} ---`);
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Name: ${user.first_name} ${user.last_name}`);
        console.log(`Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log(`Created: ${user.created_at}`);
        console.log(`Updated: ${user.updated_at}`);
        console.log('');
      });

      console.log('📝 Current admin login credentials:');
      console.log(`Email: ${adminUsers[0].email}`);
      console.log(`Username: ${adminUsers[0].username}`);
      console.log('Password: [Hashed in database - cannot be retrieved]');
      console.log('');
      console.log('💡 To change the password, run: node change_admin_credentials.js');
    }

    // Also check for any users with admin role
    const [allUsers] = await connection.execute(
      'SELECT id, username, email, role, first_name, last_name, is_active FROM users ORDER BY role, created_at'
    );

    if (allUsers.length > 0) {
      console.log('📊 All users in database:');
      console.log('ID | Username | Email | Role | Name | Active');
      console.log('---|----------|-------|------|------|-------');
      
      allUsers.forEach(user => {
        const status = user.is_active ? '✅' : '❌';
        console.log(`${user.id} | ${user.username} | ${user.email} | ${user.role} | ${user.first_name} ${user.last_name} | ${status}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking admin credentials:', error);
  } finally {
    await connection.end();
  }
}

checkAdminCredentials();
