const logger = require('../utils/logger');

// PostgreSQL error codes
const PG_UNIQUE_VIOLATION = '23505';
const PG_FOREIGN_KEY_VIOLATION = '23503';
const PG_NOT_NULL_VIOLATION = '23502';
const PG_CHECK_VIOLATION = '23514';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${statusCode}: ${err.message}`);
  }

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

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File is too large (max 5MB allowed)';
    } else {
      message = err.message;
    }
    statusCode = 400;
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    message = 'Invalid JSON payload';
    statusCode = 400;
  }

  if (err.type === 'entity.too.large') {
    message = 'Request payload is too large';
    statusCode = 413;
  }

  // Never leak internal error details to clients in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
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