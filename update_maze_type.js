const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateMazeType() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prek_db'
  });

  try {
    console.log('Adding maze type to activities table...');
    
    // Add maze type to the enum
    await connection.execute(`
      ALTER TABLE activities 
      MODIFY COLUMN \`type\` enum('coloring','letter_match','bubble_pop','counting','emotion_match','family_tree','digital_painting','forest_hunt','puzzle','maze') NOT NULL
    `);
    
    console.log('✅ Maze type added successfully to activities table!');
    
    // Also update the activity_types table if it exists
    try {
      await connection.execute(`
        ALTER TABLE activity_types 
        MODIFY COLUMN \`activity_type\` enum('coloring','letter_match','bubble_pop','counting','emotion_match','family_tree','digital_painting','forest_hunt','puzzle','maze')
      `);
      console.log('✅ Maze type added to activity_types table as well!');
    } catch (error) {
      console.log('Note: activity_types table not found or already updated');
    }
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
  } finally {
    await connection.end();
  }
}

updateMazeType();
