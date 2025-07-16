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

## 📚 API Documentation

### Authentication Endpoints

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Cryptocurrency Endpoints

#### Get All Cryptocurrencies

```http
GET /api/cryptocurrencies
```

**Response:**

```json
{
  "cryptocurrencies": [
    {
      "id": "uuid",
      "coinId": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "currentPrice": "45000.00",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get Cryptocurrency by ID

```http
GET /api/cryptocurrencies/:id
```

**Response:**

```json
{
  "cryptocurrency": {
    "id": "uuid",
    "coinId": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "currentPrice": 50000.0,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

> **Note**: Prices are automatically updated every minute by the scheduler.

### Alert Endpoints

#### Create Alert

```http
POST /api/alerts
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "cryptocurrencyId": "uuid",
  "alertType": "ABOVE",
  "targetPrice": 50000
}
```

**Response:**

```json
{
  "message": "Alert created successfully",
  "alert": {
    "id": "uuid",
    "userId": "uuid",
    "cryptocurrencyId": "uuid",
    "alertType": "ABOVE",
    "targetPrice": "50000",
    "isTriggered": false,
    "triggeredPrice": null,
    "triggeredAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Get User Alerts

```http
GET /api/alerts
Authorization: Bearer <jwt-token>
```

#### Get Triggered Alerts

```http
GET /api/alerts/triggered
Authorization: Bearer <jwt-token>
```

#### Get Alert by ID

```http
GET /api/alerts/:id
Authorization: Bearer <jwt-token>
```

#### Update Alert

```http
PUT /api/alerts/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "targetPrice": 55000
}
```

#### Delete Alert

```http
DELETE /api/alerts/:id
Authorization: Bearer <jwt-token>
```


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
