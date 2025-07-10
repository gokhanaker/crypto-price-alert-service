import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 6000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'CryptoPriceAlertServiceSecretJwtKey',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/crypto_price_alert_db',
  coinGeckoApiUrl: 'https://api.coingecko.com/api/v3',
  priceUpdateInterval: process.env.PRICE_UPDATE_INTERVAL || '1', // minutes
  enableRealTimeUpdates: process.env.ENABLE_REALTIME_UPDATES === 'true',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),

  // Security
  corsOrigin: process.env.CORS_ORIGIN || '*',
  helmetEnabled: process.env.HELMET_ENABLED !== 'false',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};
