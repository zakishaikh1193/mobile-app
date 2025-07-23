const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const contentRoutes = require('./routes/contentRoutes');
const pool = require('./models/db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/uploads', express.static('uploads'));

app.use('/api/content', contentRoutes);

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

app.get('/api', (req, res) => {
    res.send('<h1>Welcome to Express.js!</h1>');
});

// Test the database connection
const checkDatabaseConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to database successfully');
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
};

app.listen(PORT, () => {
  console.log(`Server running in ${ENV} mode on port ${PORT}`);
  if (ENV === 'production') {
    console.log('Access the app at: http://pre-k-legato.local');
  } else {
    console.log('Access the app at: http://localhost:' + PORT);
  }
  checkDatabaseConnection();
}); 