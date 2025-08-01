const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = {};
    
    // Format Mongoose validation errors
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Handle JWT expired error
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Handle duplicate key errors
  if (err.code === 1062 || (err.code === 'ER_DUP_ENTRY')) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    
    // Extract the duplicate field from the error message
    const match = err.message.match(/Duplicate entry '(.*?)' for key/);
    if (match && match[1]) {
      errors = { [match[1].split('.')[1] || 'field']: 'This value already exists' };
    }
  }

  // Handle foreign key constraint errors
  if (err.code === 'ER_NO_REFERENCED_ROW') {
    statusCode = 400;
    message = 'Referenced record not found';
  }

  // Handle null constraint errors
  if (err.code === 'ER_BAD_NULL_ERROR') {
    statusCode = 400;
    message = 'Required field is missing';
    
    // Extract the field name from the error message
    const match = err.message.match(/Column '(.*?)' cannot be null/);
    if (match && match[1]) {
      errors = { [match[1]]: 'This field is required' };
    }
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || undefined,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { errorHandler };
