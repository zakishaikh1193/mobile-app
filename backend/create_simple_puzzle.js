const mysql = require('mysql2/promise');

async function createSimplePuzzle() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    console.log('Creating a simple puzzle activity...');
    
    const puzzleConfig = {
      gameType: 'puzzle',
      pieceCount: 9,
      gridSize: 3,
      difficulty: 'easy'
    };
    
    // Insert puzzle activity with minimal required fields
    const [result] = await pool.query(`
      INSERT INTO activities (
        title, 
        description, 
        type, 
        difficulty, 
        image_path, 
        data,
        status
      ) VALUES (?, ?, 'puzzle', ?, ?, ?, 'active')
    `, [
      'Simple Animal Puzzle',
      'A fun puzzle for young learners',
      'easy',
      'uploads/activities/puzzle_image-1754999760320-89118018.jpg',
      JSON.stringify(puzzleConfig)
    ]);
    
    console.log('✅ Puzzle activity created!');
    console.log('ID:', result.insertId);
    
    // Test the API endpoint
    console.log('\nTesting API endpoint...');
    const [puzzle] = await pool.query(`
      SELECT * FROM activities WHERE id = ? AND type = 'puzzle'
    `, [result.insertId]);
    
    if (puzzle.length > 0) {
      console.log('✅ Puzzle found in database');
      console.log('Title:', puzzle[0].title);
      console.log('Type:', puzzle[0].type);
      console.log('Status:', puzzle[0].status);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

createSimplePuzzle();

