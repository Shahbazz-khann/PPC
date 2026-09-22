require('dotenv').config({ quiet: true });

const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const { connectDB, pool } = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorMiddleware');

const authRoutes = require('./routes/Auth/auth.routes');
const customerRoutes = require('./routes/Customer');
const referenceRoutes = require('./routes/Reference');
const publicRoutes = require('./routes/Public/public.routes');

// --------------------------------------------------
// Environment
// --------------------------------------------------

const REQUIRED_ENV = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length) {
  logger.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';
// Under IIS/iisnode, PORT is a named pipe (e.g. "\\.\pipe\...") — pass it through as-is
const port = process.env.PORT || 5000;
const VERSION = process.env.VERSION || '1.0.0';
const API_VERSION = process.env.API_VERSION || 'v1';

// Comma-separated list, e.g. "https://ppc.com,https://www.ppc.com"
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !allowedOrigins.length) {
  logger.error('FRONTEND_URL must be set in production');
  process.exit(1);
}

const app = express();

app.disable('x-powered-by');

// Needed for correct client IPs / protocol behind a reverse proxy (nginx, load balancer)
if (process.env.TRUST_PROXY) {
  app.set('trust proxy', parseInt(process.env.TRUST_PROXY, 10) || 1);
}

// --------------------------------------------------
// Security & Performance
// --------------------------------------------------

app.use(
  helmet({
    // Allow the frontend (different origin) to load uploaded images/videos
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    // No allowlist configured (development only): reflect the request origin
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 204,
  })
);

// --------------------------------------------------
// Body Parsing
// --------------------------------------------------

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --------------------------------------------------
// Static Files
// --------------------------------------------------

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    dotfiles: 'deny',
    index: false,
    maxAge: isProduction ? '7d' : 0,
  })
);

// --------------------------------------------------
// Versioned API Router
// --------------------------------------------------

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/customer', customerRoutes);
apiRouter.use('/reference', referenceRoutes);
apiRouter.use('/public', publicRoutes);

app.use(`/api/${API_VERSION}`, apiRouter);

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get('/', (req, res) => {
  res.json({
    message: 'Pakistan Property Care API is running',
    version: VERSION,
    apiVersion: API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up', uptime: process.uptime() });
  } catch (error) {
    logger.error('Health check failed', error);
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

// --------------------------------------------------
// 404 & Error Handling
// --------------------------------------------------

app.use((req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

// --------------------------------------------------
// Start Server
// --------------------------------------------------

const httpServer = http.createServer(app);

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);

  httpServer.close(async () => {
    try {
      await pool.end();
      logger.info('HTTP server and database pool closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  });

  // Force exit if connections do not close in time
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();

    httpServer.listen(port, () => {
      logger.info(`PPC server running on port ${port} (${process.env.NODE_ENV || 'development'})`);
      logger.info(`API version ${API_VERSION} available at /api/${API_VERSION}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
