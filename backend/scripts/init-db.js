const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true, // Allow multiple SQL statements
};

// Path to SQL files
const SQL_FILES = [
  path.join(__dirname, '..', 'database', 'schema.sql'),
  path.join(__dirname, '..', 'database', 'content_tables.sql'),
  path.join(__dirname, '..', 'database', 'add_user_roles_and_educational_hierarchy.sql'),
  path.join(__dirname, '..', 'database', 'create_activities_table.sql'),
  path.join(__dirname, '..', 'database', 'create_content_library.sql'),
];

async function initializeDatabase() {
  let connection;
  
  try {
    // Create a connection to the MySQL server
    connection = await mysql.createConnection({
      ...dbConfig,
      database: 'mysql', // Connect to default mysql database first
    });

    console.log('Connected to MySQL server');

    // Create the database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'prek_db'}`);
    console.log(`Database ${process.env.DB_NAME || 'prek_db'} created or already exists`);

    // Close the initial connection
    await connection.end();

    // Reconnect to the specific database
    connection = await mysql.createConnection({
      ...dbConfig,
      database: process.env.DB_NAME || 'prek_db',
    });

    // Execute each SQL file
    for (const filePath of SQL_FILES) {
      try {
        const sql = await fs.readFile(filePath, 'utf8');
        console.log(`Executing ${path.basename(filePath)}...`);
        await connection.query(sql);
        console.log(`✅ ${path.basename(filePath)} executed successfully`);
      } catch (error) {
        console.error(`❌ Error executing ${path.basename(filePath)}:`, error.message);
        // Continue with next file even if one fails
      }
    }

    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the initialization
initializeDatabase();
