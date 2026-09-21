require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
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
// Static Files
// --------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --------------------------------------------------
// Versioned API Router
// --------------------------------------------------

const apiRouter = express.Router();

// Authentication
const authRoutes = require('./routes/Auth/auth.routes');
apiRouter.use('/auth', authRoutes);

// Properties
const propertyRoutes = require('./routes/Property/PropertyRoutes');
apiRouter.use('/properties', propertyRoutes);

// Customer
const customerRoutes = require('./routes/Customer/customer.routes');
apiRouter.use('/customer', customerRoutes);

// Owner
const ownerRoutes = require('./routes/Owner/owner.routes');
apiRouter.use('/owner', ownerRoutes);

// Unified User
const userRoutes = require('./routes/User/user.routes');
apiRouter.use('/user', userRoutes);

// Inspector
const inspectorRoutes = require('./routes/Inspector/inspector.routes');
apiRouter.use('/inspector', inspectorRoutes);

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
const http = require('http');
const { initializeSocket } = require('./socket/socket.server');

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(port, () => {
      logger.info(`PPC server running on http://localhost:${port}`);
      logger.info(`API version ${API_VERSION} available at /api/${API_VERSION}`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();