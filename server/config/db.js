const { Pool, types } = require('pg');
const logger = require('../utils/logger');


// Keep PostgreSQL DATE values as YYYY-MM-DD strings
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  max: parseInt(process.env.DB_POOL_MAX, 10) || 20,
  idleTimeoutMillis:
    parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 60000,
  connectionTimeoutMillis:
    parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 30000,
});

const connectDB = async () => {
  try {
    const client = await pool.connect();

    await client.query('SELECT 1');

    client.release();

    logger.info('Connected to PostgreSQL database', {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME,
    });

    return pool;
  } catch (error) {
    logger.error('Error connecting to the database', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  pool,
};