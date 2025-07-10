import express from 'express';
import bodyParser from 'body-parser';

// Mock services
jest.mock('@/services/authService', () => ({
  AuthService: {
    register: jest.fn(async data => ({
      user: { id: 'user-1', email: data.email },
      token: 'test-token',
    })),
    login: jest.fn(async data => ({
      user: { id: 'user-1', email: data.email },
      token: 'test-token',
    })),
  },
}));

jest.mock('@/services/alertService', () => ({
  AlertService: {
    createAlert: jest.fn(async (userId, data) => ({
      id: 'alert-1',
      userId,
      ...data,
    })),
    getUserAlerts: jest.fn(async userId => [
      { id: 'alert-1', userId, cryptocurrencyId: 'crypto-1', alertType: 'ABOVE', targetPrice: 100 },
    ]),
    updateAlert: jest.fn(async (alertId, userId, data) => ({
      id: alertId,
      userId,
      ...data,
    })),
    deleteAlert: jest.fn(async (alertId, userId) => true),
  },
}));

// Mock auth middleware
jest.mock('@/middleware/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { id: 'user-1' };
    next();
  },
}));

// Mock validation middleware
jest.mock('@/middleware/validation', () => ({
  validateRequest: () => (req: any, res: any, next: any) => {
    // Simple validation for auth routes
    if (req.path.includes('/auth/')) {
      if (req.body.email === 'invalid-email' || req.body.password === '') {
        return res.status(400).json({ error: 'Validation error' });
      }
    }
    next();
  },
  createAlertSchema: {},
  updateAlertSchema: {},
  userRegistrationSchema: {},
  userLoginSchema: {},
}));

export function createTestApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use('/api/auth', require('@/routes/auth').default);
  app.use('/api/alerts', require('@/routes/alerts').default);
  // 404 handler
  app.use('*', (req: any, res: any) => res.status(404).json({ error: 'Route not found' }));
  return app;
}
