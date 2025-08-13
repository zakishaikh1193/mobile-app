const mysql = require('mysql2/promise');

async function checkPuzzles() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    const [rows] = await pool.query('SELECT * FROM activities WHERE type = "puzzle" LIMIT 5');
    console.log('Puzzle activities:', rows);
    
    if (rows.length === 0) {
      console.log('No puzzle activities found in database');
    } else {
      console.log('Found', rows.length, 'puzzle activities');
      rows.forEach((row, index) => {
        console.log(`\nPuzzle ${index + 1}:`);
        console.log('ID:', row.id);
        console.log('Title:', row.title);
        console.log('Image path:', row.image_path);
        console.log('Data:', row.data);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkPuzzles();

