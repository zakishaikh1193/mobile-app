const mysql = require('mysql2/promise');

async function showActivityTypes() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'prek_db'
  });

  try {
    // Get the table structure to see the enum values
    const [structure] = await pool.query('DESCRIBE activities');
    const typeField = structure.find(field => field.Field === 'type');
    
    console.log('=== AVAILABLE ACTIVITY TYPES ===');
    console.log('Type field definition:', typeField.Type);
    
    // Extract enum values from the type definition
    const enumMatch = typeField.Type.match(/enum\((.*)\)/);
    if (enumMatch) {
      const enumValues = enumMatch[1].split(',').map(val => val.replace(/'/g, '').trim());
      console.log('\nTotal activity types available:', enumValues.length);
      console.log('\nActivity Types:');
      enumValues.forEach((type, index) => {
        console.log(`${index + 1}. ${type}`);
      });
    }
    
    // Show existing activities by type
    console.log('\n=== EXISTING ACTIVITIES BY TYPE ===');
    const [activities] = await pool.query('SELECT type, COUNT(*) as count FROM activities WHERE status = "active" GROUP BY type');
    activities.forEach(activity => {
      console.log(`${activity.type}: ${activity.count} activities`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

showActivityTypes();

