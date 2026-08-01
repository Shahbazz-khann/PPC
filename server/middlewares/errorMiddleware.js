const logger = require('../utils/logger');

// PostgreSQL error codes
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';
const PG_CHECK_VIOLATION = '23514';

const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PostgreSQL constraint errors
  if (err.code === PG_UNIQUE_VIOLATION) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  if (err.code === PG_FOREIGN_KEY_VIOLATION) {
    message = 'Invalid reference. Related record does not exist.';
    statusCode = 400;
  }

  if (err.code === PG_NOT_NULL_VIOLATION) {
    message = 'Required field cannot be null';
    statusCode = 400;
  }

  if (err.code === PG_CHECK_VIOLATION) {
    message = err.message || 'Check constraint violated';
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    error: message,

    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      code: err.code,
      detail: err.detail,
    }),
  });
};

module.exports = { errorHandler };