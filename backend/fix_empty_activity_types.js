const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEmptyActivityTypes() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('🔧 Fixing Activities with Empty Type Values...\n');

    // First, let's see what we have
    const [activities] = await connection.execute(
      'SELECT id, title, type, status FROM activities WHERE type = "" OR type IS NULL'
    );

    if (activities.length === 0) {
      console.log('✅ No activities with empty type values found!');
      return;
    }

    console.log(`⚠️  Found ${activities.length} activities with empty type values:\n`);
    activities.forEach((activity, index) => {
      console.log(`${index + 1}. ID: ${activity.id} | Title: "${activity.title}" | Status: ${activity.status}`);
    });

    // Ask user what to do
    console.log('\n🔧 Options:');
    console.log('1. Set all empty types to "coloring" (default)');
    console.log('2. Set all empty types to "puzzle"');
    console.log('3. Set all empty types to "maze"');
    console.log('4. Delete all activities with empty types');
    console.log('5. Skip (do nothing)');

    // For now, let's set them to "coloring" as default
    const defaultType = 'coloring';
    
    console.log(`\n🔄 Setting all empty types to "${defaultType}"...`);
    
    const [updateResult] = await connection.execute(
      'UPDATE activities SET type = ?, updated_at = NOW() WHERE type = "" OR type IS NULL',
      [defaultType]
    );

    console.log(`✅ Updated ${updateResult.affectedRows} activities to type "${defaultType}"`);

    // Verify the fix
    const [verifyActivities] = await connection.execute(
      'SELECT id, title, type, status FROM activities WHERE type = "" OR type IS NULL'
    );

    if (verifyActivities.length === 0) {
      console.log('✅ All empty type values have been fixed!');
    } else {
      console.log(`⚠️  Still have ${verifyActivities.length} activities with empty types`);
    }

  } catch (error) {
    console.error('❌ Error fixing activity types:', error);
  } finally {
    await connection.end();
  }
}

fixEmptyActivityTypes();
