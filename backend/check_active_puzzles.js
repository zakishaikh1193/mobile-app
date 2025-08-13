const mysql = require('mysql2/promise');

async function checkActivePuzzles() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    console.log('🔍 Checking Active Puzzle Activities...\n');
    
    const [rows] = await pool.query(`
      SELECT id, title, type, status, difficulty, image_path 
      FROM activities 
      WHERE type = 'puzzle' AND status = 'active'
    `);
    
    if (rows.length === 0) {
      console.log('❌ No active puzzle activities found');
    } else {
      console.log(`✅ Found ${rows.length} active puzzle activity(ies):\n`);
      rows.forEach((row, index) => {
        console.log(`🎯 Puzzle ${index + 1}:`);
        console.log(`   ID: ${row.id}`);
        console.log(`   Title: "${row.title}"`);
        console.log(`   Type: ${row.type}`);
        console.log(`   Status: ${row.status}`);
        console.log(`   Difficulty: ${row.difficulty}`);
        console.log(`   Image: ${row.image_path}`);
        console.log('');
      });
    }
    
    // Also check total puzzle activities
    const [allPuzzles] = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM activities 
      WHERE type = 'puzzle' 
      GROUP BY status
    `);
    
    console.log('📊 Total Puzzle Activities by Status:');
    allPuzzles.forEach(row => {
      console.log(`   ${row.status}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkActivePuzzles();
