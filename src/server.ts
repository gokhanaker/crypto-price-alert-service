import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from '@/config/env';
import { logger } from '@/services/loggerService';
import authRoutes from '@/routes/auth';
import cryptocurrencyRoutes from '@/routes/cryptocurrencies';
import alertRoutes from '@/routes/alerts';
import healthRoutes from '@/routes/health';
import eventRoutes from '@/routes/events';
import { SchedulerService } from '@/services/schedulerService';
import { EventController } from '@/controllers/eventController';

const app = express();
const PORT = config.port;

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('⚠️  Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
    });
  },
});

// Apply rate limiting to all routes
app.use(limiter);

if (config.helmetEnabled) {
  app.use(helmet());
}
app.use(
  cors({
    origin: config.corsOrigin,
  })
);
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cryptocurrencies', cryptocurrencyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/events', eventRoutes);

// 404 handler
app.use('*', (req: express.Request, res: express.Response) => {
  logger.warn('⚠️  404 Route not found', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('❌ Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
  res.status(500).json({ error: 'Something went wrong!' });
});

const initializeServices = async () => {
  try {
    logger.info('🚀 Initializing services...');

    EventController.getInstance();
    logger.info('✅ EventController initialized');

    logger.info('✅ PriceUpdateService ready');
    SchedulerService.initializeScheduler();

    logger.info('✅ SchedulerService initialized');
    logger.info('🎉 All services initialized successfully');
  } catch (error) {
    logger.error('❌ Failed to initialize services', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    await initializeServices();

    app.listen(PORT, () => {
      logger.info('🚀 Server started successfully', {
        port: PORT,
        environment: config.nodeEnv,
        nodeVersion: process.version,
        platform: process.platform,
      });
    });
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Shutdown
process.on('SIGTERM', async () => {
  logger.info('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('❌ Uncaught Exception', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise.toString(),
  });
  process.exit(1);
});

startServer();
