import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { config } from '@/config/env';
import authRoutes from '@/routes/auth';
import cryptocurrencyRoutes from '@/routes/cryptocurrencies';
import alertRoutes from '@/routes/alerts';
import healthRoutes from '@/routes/health';
import eventRoutes from '@/routes/events';

// Mock all services and database
jest.mock('@/services/authService');
jest.mock('@/services/alertService');
jest.mock('@/services/cryptocurrencyService');
jest.mock('@/services/schedulerService');
jest.mock('@/services/eventService');
jest.mock('@/services/loggerService');
jest.mock('@/config/database');
jest.mock('@/middleware/auth');

// Create test app
export const createTestApp = () => {
  const app = express();

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);

  if (config.helmetEnabled) {
    app.use(helmet());
  }

  app.use(cors({ origin: config.corsOrigin }));
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
    res.status(404).json({ error: 'Route not found' });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(500).json({ error: 'Something went wrong!' });
  });

  return app;
};

// Test utilities
export const generateTestToken = (userId: string = 'test-user-id') => {
  return `test-token-${userId}`;
};

export const mockAuthenticatedUser = (userId: string = 'test-user-id') => {
  const { authenticateToken } = require('@/middleware/auth');
  authenticateToken.mockImplementation((req: any, res: any, next: any) => {
    req.user = { id: userId };
    next();
  });
};

export const mockUnauthenticatedUser = () => {
  const { authenticateToken } = require('@/middleware/auth');
  authenticateToken.mockImplementation((req: any, res: any, next: any) => {
    res.status(401).json({ error: 'Unauthorized' });
  });
};
