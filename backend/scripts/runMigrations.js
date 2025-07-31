const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;
require('dotenv').config();

async function runMigrations() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', 
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true // Allow multiple SQL statements
  });

  try {
    console.log('Starting database migrations...');
    
    // Read and execute schema.sql
    console.log('Executing schema...');
    const schemaSql = await fs.readFile(
      path.join(__dirname, '../database/schema.sql'), 
      'utf8'
    );
    await connection.query(schemaSql);
    
    // Read and execute create_tables.sql
    console.log('Creating tables...');
    const createTablesSql = await fs.readFile(
      path.join(__dirname, '../database/create_tables.sql'), 
      'utf8'
    );
    await connection.query(createTablesSql);
    
    // Read and execute create_activities_table.sql
    console.log('Creating activities table...');
    const createActivitiesSql = await fs.readFile(
      path.join(__dirname, '../database/create_activities_table.sql'), 
      'utf8'
    );
    await connection.query(createActivitiesSql);
    
    // Execute the new migrations
    console.log('Running migrations...');
    const migrationsSql = await fs.readFile(
      path.join(__dirname, '../database/add_user_roles_and_educational_hierarchy.sql'), 
      'utf8'
    );
    await connection.query(migrationsSql);
    
    console.log('✅ Database migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the migrations
runMigrations();
