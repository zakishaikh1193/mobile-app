const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testAuth() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('🔐 Testing Authentication...\n');

    // Get admin user
    const [adminUsers] = await connection.execute(
      'SELECT id, username, email, role FROM users WHERE role = "admin" LIMIT 1'
    );

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      return;
    }

    const adminUser = adminUsers[0];
    console.log('✅ Found admin user:', adminUser);

    // Create a test token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const testToken = jwt.sign(
      { 
        id: adminUser.id, 
        username: adminUser.username, 
        email: adminUser.email, 
        role: adminUser.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    console.log('✅ Test token created successfully');
    console.log('Token:', testToken.substring(0, 50) + '...');

    // Verify the token
    try {
      const decoded = jwt.verify(testToken, JWT_SECRET);
      console.log('✅ Token verification successful');
      console.log('Decoded token:', decoded);
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }

    // Test middleware
    console.log('\n🧪 Testing Auth Middleware...');
    
    // Simulate the auth middleware logic
    const testHeaders = {
      authorization: `Bearer ${testToken}`
    };

    if (testHeaders.authorization && testHeaders.authorization.startsWith('Bearer')) {
      const token = testHeaders.authorization.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Auth middleware test successful');
        console.log('User:', decoded);
        
        if (decoded.role === 'admin') {
          console.log('✅ Admin role verified');
        } else {
          console.log('❌ User is not admin');
        }
      } catch (error) {
        console.log('❌ Auth middleware test failed:', error.message);
      }
    } else {
      console.log('❌ No Bearer token found');
    }

  } catch (error) {
    console.error('❌ Error testing auth:', error);
  } finally {
    await connection.end();
  }
}

testAuth();
