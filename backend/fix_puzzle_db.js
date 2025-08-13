const mysql = require('mysql2/promise');

async function fixPuzzleType() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    console.log('Fixing activities table to include puzzle type...');
    
    // Add 'puzzle' to the enum
    await pool.query(`
      ALTER TABLE \`activities\` 
      MODIFY COLUMN \`type\` enum('coloring','letter_match','bubble_pop','counting','emotion_match','family_tree','digital_painting','forest_hunt','puzzle') NOT NULL
    `);
    
    console.log('Successfully added puzzle type to activities table');
    
    // Verify the change
    const [structure] = await pool.query('DESCRIBE activities');
    const typeField = structure.find(field => field.Field === 'type');
    console.log('Updated type field:', typeField);
    
  } catch (error) {
    console.error('Error fixing puzzle type:', error);
  } finally {
    await pool.end();
  }
}

fixPuzzleType();

