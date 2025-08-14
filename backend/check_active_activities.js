const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkActiveActivities() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('🔍 Checking ACTIVE Activities in Database...\n');

    // Check only active activities
    const [activities] = await connection.execute(
      'SELECT id, title, type, status FROM activities WHERE status = "active" ORDER BY type'
    );

    if (activities.length === 0) {
      console.log('❌ No active activities found in database!');
      return;
    }

    console.log(`✅ Found ${activities.length} ACTIVE activities:\n`);
    
    // Group by type
    const typeCounts = {};
    activities.forEach(activity => {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
    });

    console.log('📊 Active Activity Types Summary:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} activities`);
    });

    console.log('\n📋 All Active Activities:');
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ID: ${activity.id} | Type: ${activity.type} | Title: "${activity.title}"`);
    });

  } catch (error) {
    console.error('❌ Error checking active activities:', error);
  } finally {
    await connection.end();
  }
}

checkActiveActivities();
