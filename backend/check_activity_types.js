const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkActivityTypes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('🔍 Checking Activity Types in Database...\n');

    // Check all activity types
    const [activities] = await connection.execute(
      'SELECT id, title, type, status FROM activities ORDER BY type'
    );

    if (activities.length === 0) {
      console.log('❌ No activities found in database!');
      return;
    }

    console.log(`✅ Found ${activities.length} activities:\n`);
    
    // Group by type
    const typeCounts = {};
    activities.forEach(activity => {
      typeCounts[activity.type] = (typeCounts[activity.type] || 0) + 1;
    });

    console.log('📊 Activity Types Summary:');
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count} activities`);
    });

    console.log('\n📋 All Activities:');
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ID: ${activity.id} | Type: ${activity.type} | Title: "${activity.title}" | Status: ${activity.status}`);
    });

    // Check if there are any unknown types
    const knownTypes = [
      'coloring', 'letter_match', 'bubble_pop', 'counting', 
      'emotion_match', 'family_tree', 'digital_painting', 
      'forest_hunt', 'puzzle', 'maze', 'memory_match'
    ];

    const unknownTypes = Object.keys(typeCounts).filter(type => !knownTypes.includes(type));
    if (unknownTypes.length > 0) {
      console.log('\n⚠️  Unknown Activity Types Found:');
      unknownTypes.forEach(type => {
        console.log(`  - ${type}`);
      });
    } else {
      console.log('\n✅ All activity types are known!');
    }

  } catch (error) {
    console.error('❌ Error checking activity types:', error);
  } finally {
    await connection.end();
  }
}

checkActivityTypes();
