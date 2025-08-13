const mysql = require('mysql2/promise');

async function createActivity() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    // Available activity types
    const activityTypes = [
      'coloring',
      'letter_match', 
      'bubble_pop',
      'counting',
      'emotion_match',
      'family_tree',
      'digital_painting',
      'forest_hunt',
      'puzzle'
    ];

    console.log('=== CREATE NEW ACTIVITY ===');
    console.log('Available activity types:');
    activityTypes.forEach((type, index) => {
      console.log(`${index + 1}. ${type}`);
    });

    // For demo purposes, let's create a sample puzzle activity
    console.log('\nCreating a sample puzzle activity...');
    
    const puzzleConfig = {
      gameType: 'puzzle',
      pieceCount: 9,
      gridSize: 3,
      difficulty: 'easy'
    };
    
    // Insert puzzle activity without foreign key constraints
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
      'Fun Animal Puzzle',
      'A delightful puzzle featuring cute animals. Perfect for young learners!',
      'easy',
      'uploads/activities/puzzle_image-1754999760320-89118018.jpg',
      JSON.stringify(puzzleConfig)
    ]);
    
    console.log('✅ Activity created successfully!');
    console.log('Activity ID:', result.insertId);
    console.log('Type: puzzle');
    console.log('Title: Fun Animal Puzzle');
    
    // Verify it was created
    const [puzzles] = await pool.query('SELECT * FROM activities WHERE type = "puzzle" AND status = "active"');
    console.log('\nTotal active puzzle activities:', puzzles.length);
    
  } catch (error) {
    console.error('❌ Error creating activity:', error.message);
  } finally {
    await pool.end();
  }
}

createActivity();

