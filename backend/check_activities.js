const mysql = require('mysql2/promise');

async function checkActivities() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    // Check all activities
    const [allActivities] = await pool.query('SELECT id, title, type, status FROM activities LIMIT 10');
    console.log('All activities:', allActivities);
    
    // Check activity types
    const [types] = await pool.query('SELECT DISTINCT type FROM activities');
    console.log('Activity types:', types);
    
    // Check table structure
    const [structure] = await pool.query('DESCRIBE activities');
    console.log('Activities table structure:', structure);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

checkActivities();

