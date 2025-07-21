-- Create a new database user
CREATE USER IF NOT EXISTS 'prek_user'@'localhost' IDENTIFIED BY 'prek_password';

-- Create the database
CREATE DATABASE IF NOT EXISTS prek_db;

-- Grant permissions to the user
GRANT ALL PRIVILEGES ON prek_db.* TO 'prek_user'@'localhost';

-- Apply the changes
FLUSH PRIVILEGES;
