require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorMiddleware');

const app = express();

const port = process.env.PORT || 5000;
const VERSION = process.env.VERSION || '1.0.0';
const API_VERSION = process.env.API_VERSION || 'v1';

// --------------------------------------------------
// CORS Configuration
// --------------------------------------------------

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// --------------------------------------------------
// Body Parsing Middleware
// --------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// Versioned API Router
// --------------------------------------------------

const apiRouter = express.Router();

// Authentication
const authRoutes = require('./routes/Auth/auth.routes');
apiRouter.use('/auth', authRoutes);



// API routes will be added here later.

// Example:
// apiRouter.use('/auth', authRoutes);

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

// --------------------------------------------------
// 404 Handler
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

const startServer = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      logger.info(`PPC server running on http://localhost:${port}`);
      logger.info(`API version ${API_VERSION} available at /api/${API_VERSION}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();