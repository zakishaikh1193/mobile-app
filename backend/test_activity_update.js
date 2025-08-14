const mysql = require('mysql2/promise');
require('dotenv').config();

async function testActivityUpdate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('🔍 Testing Activity Update Functionality...\n');

    // Check if activities exist
    const [activities] = await connection.execute(
      'SELECT id, title, type, status FROM activities WHERE status = "active" LIMIT 5'
    );

    if (activities.length === 0) {
      console.log('❌ No activities found in database!');
      console.log('You need to create some activities first.');
      return;
    }

    console.log(`✅ Found ${activities.length} activities:\n`);
    
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ID: ${activity.id} | Title: ${activity.title} | Type: ${activity.type} | Status: ${activity.status}`);
    });

    // Test updating the first activity
    const testActivity = activities[0];
    console.log(`\n🧪 Testing update for activity ID: ${testActivity.id}`);
    
    const [updateResult] = await connection.execute(
      'UPDATE activities SET title = ?, updated_at = NOW() WHERE id = ?',
      [`${testActivity.title} (Updated)`, testActivity.id]
    );

    if (updateResult.affectedRows > 0) {
      console.log('✅ Activity update test successful!');
      
      // Verify the update
      const [verifyResult] = await connection.execute(
        'SELECT title FROM activities WHERE id = ?',
        [testActivity.id]
      );
      
      if (verifyResult.length > 0) {
        console.log(`✅ Verified update: "${verifyResult[0].title}"`);
      }
      
      // Revert the test change
      await connection.execute(
        'UPDATE activities SET title = ?, updated_at = NOW() WHERE id = ?',
        [testActivity.title, testActivity.id]
      );
      console.log('✅ Reverted test change');
      
    } else {
      console.log('❌ Activity update test failed!');
    }

    // Check database structure
    console.log('\n📊 Database Structure Check:');
    const [columns] = await connection.execute(
      'DESCRIBE activities'
    );
    
    console.log('Activity table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

  } catch (error) {
    console.error('❌ Error testing activity update:', error);
  } finally {
    await connection.end();
  }
}

testActivityUpdate();
