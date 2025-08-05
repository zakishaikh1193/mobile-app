const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const contentRoutes = require('./routes/contentRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const childRoutes = require('./routes/childRoutes');
const { errorHandler } = require('./middleware/error');
const pool = require('./models/db');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Static folder
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/children', childRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/educational', require('./routes/educationalRoutes'));

// Error handling middleware (should be after all other middleware and routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || 'development';

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Welcome endpoint
app.get('/api', (req, res) => {
  res.send('<h1>Welcome to Express.js!</h1>');
});

// Test database connection endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({
      success: true,
      message: 'Database connection successful',
      data: result[0]
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// Test the database connection
const checkDatabaseConnection = async () => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    console.log('✅ Connected to database successfully');
  } catch (err) {
    console.error('❌ Error connecting to database:', err);
  }
};

app.listen(PORT, () => {
  console.log(`Server running in ${ENV} mode on port ${PORT}`);
  if (ENV === 'production') {
    console.log('Access the app at: https://prek-backend.bylinelms.com');
  } else {
    console.log('Access the app at: http://localhost:' + PORT);
  }
  checkDatabaseConnection();
}); 