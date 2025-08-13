const mysql = require('mysql2/promise');
const path = require('path');

async function createSamplePuzzle() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    console.log('Creating sample puzzle activity...');
    
    // Sample puzzle configuration
    const puzzleConfig = {
      gameType: 'puzzle',
      pieceCount: 9,
      gridSize: 3,
      difficulty: 'easy'
    };
    
    // Use the existing puzzle image from uploads
    const imagePath = 'uploads/activities/puzzle_image-1754999760320-89118018.jpg';
    
    // Insert sample puzzle activity
    const [result] = await pool.query(`
      INSERT INTO activities (
        title, 
        description, 
        type, 
        difficulty, 
        image_path, 
        data,
        status,
        grade_id,
        book_id,
        unit_id,
        lesson_id
      ) VALUES (?, ?, 'puzzle', ?, ?, ?, 'active', 1, 1, 1, 1)
    `, [
      'Sample Animal Puzzle',
      'A fun puzzle featuring a cute animal image. Drag the pieces to complete the picture!',
      'easy',
      imagePath,
      JSON.stringify(puzzleConfig)
    ]);
    
    console.log('Sample puzzle activity created with ID:', result.insertId);
    
    // Verify it was created
    const [puzzles] = await pool.query('SELECT * FROM activities WHERE type = "puzzle"');
    console.log('Puzzle activities in database:', puzzles.length);
    
  } catch (error) {
    console.error('Error creating sample puzzle:', error);
  } finally {
    await pool.end();
  }
}

createSamplePuzzle();

