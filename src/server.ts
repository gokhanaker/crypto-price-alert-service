import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from '@/config/env';
import { logger } from '@/services/loggerService';
import authRoutes from '@/routes/auth';
import cryptocurrencyRoutes from '@/routes/cryptocurrencies';
import alertRoutes from '@/routes/alerts';
import healthRoutes from '@/routes/health';
import eventRoutes from '@/routes/events';
import { SchedulerService } from '@/services/schedulerService';
import { EventController } from '@/controllers/eventController';
import { CommonErrorCodes, createErrorResponse } from '@/utils/errorResponse';

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
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    res
      .status(429)
      .json(
        createErrorResponse(
          req,
          CommonErrorCodes.RATE_LIMIT_EXCEEDED,
          'Too many requests from this IP, please try again later.'
        )
      );
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/cryptocurrencies', cryptocurrencyRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/events', eventRoutes);

const initializeServices = async () => {
  try {
    EventController.getInstance();
    SchedulerService.initializeScheduler();

    logger.info('SchedulerService initialized');
    logger.info('All services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', {
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
      logger.info('Server started successfully', {
        port: PORT,
        environment: config.nodeEnv,
        nodeVersion: process.version,
        platform: process.platform,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
};

// Shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();
