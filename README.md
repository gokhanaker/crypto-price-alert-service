# Crypto Price Alert Service

A Node.js-based cryptocurrency price alert service that enables users to set alerts for cryptocurrency price fluctuations. Built with TypeScript, Express, PostgreSQL, and Prisma.

## 🚀 Features

- **User Registration & Authentication**: Registering user with secure password hashing and JWT-based authentication
- **Cryptocurrency Management**: Real-time price data from CoinGecko API
- **Enhanced Price Alerts**: Set alerts for when prices go above or below target values
- **Automatic Price Updates**: Cron job scheduler updates prices every minute
- **Rate Limiting**: Protection against API abuse
- **Enhanced Security**: Helmet security headers and CORS configuration
- **Health Monitoring**: Detailed health check endpoint with system metrics

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Joi
- **External API**: CoinGecko for cryptocurrency data
- **Testing**: Jest
- **Logging**: Winston
- **Security**: Helmet, Rate Limiting

## 🏗️ Implementation Decisions

### CoinGecko API Integration

**Decision**: Integrated with CoinGecko API for real-time cryptocurrency price data.

- CoinGecko provides reliable, free cryptocurrency price data
- Supports 10,000+ cryptocurrencies with comprehensive market data
- No API key required for basic usage (rate-limited)

### Scheduler Implementation

**Decision**: Implemented a cron-based scheduler to automatically update cryptocurrency prices with real market data.

- Ensures price data is always current and accurate
- Reduces dependency on manual price updates
- Enables real-time alert triggering

### Event-Driven Architecture

**Decision**: Implemented event-emitting system for alert notifications with simulation capabilities.

**Current Implementation (Development/Testing)**:
- Uses Node.js EventEmitter for internal event handling
- EventController simulates multiple notification types (email, push, SMS)

**Production Deployment Considerations**:
- **Current**: Events are simulated within the same service
- **Recommended**: In a real deployed project, events should be emitted to external services:
  - **Message Queue**: Use Redis/RabbitMQ/Kafka for event distribution
  - **Notification Service**: Separate microservice for handling notifications

**Event Flow (Production)**:
```
Alert Triggered → Event Bus → Notification Service → Email/Push/SMS Services
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone https://github.com/gokhanaker/crypto-price-alert-service
cd crypto-price-alert-service
npm install
cp env.example .env
```

### 2. Start Database and Server

```bash
# Start PostgreSQL container and setup database
docker-compose up -d postgres
./scripts/setup-db.sh

# Start development server
npm run dev
```

### 3. Network Requirements

**Important**: This service requires internet connectivity to fetch real-time cryptocurrency prices from the CoinGecko API. Some WiFi networks or corporate firewalls may block connections to cryptocurrency APIs or websites. If you encounter connection issues:

- Ensure your network allows connections to `api.coingecko.com`
- Check if your WiFi settings block cryptocurrency-related websites
- Consider using a different network if your current one has restrictions


The server will start on `http://localhost:6000`
Your database will contain 10 default cryptocurrencies ready for development.


## 📦 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:migrate      # Run database migrations
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Testing
npm test                      # Run tests
npm run test:unit             # Run unit tests
npm run test:integration      # Run integration tests

# Linting
npm run lint            # Run ESLint
```
