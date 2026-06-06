/**
 * Global Error Handler Middleware
 * Catches and formats all errors in the application
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(err.stack);

  // Default error
  let error = {
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      success: false,
      message,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      success: false,
      message,
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message);
    error = {
      success: false,
      message: message.join(', '),
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = {
      success: false,
      message,
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = {
      success: false,
      message,
    };
  }

  res.status(err.statusCode || 500).json(error);
};

module.exports = errorHandler;
