-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('ABOVE', 'BELOW');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" VARCHAR(50),
    "lastName" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_email_key" UNIQUE ("email")
);

-- CreateTable
CREATE TABLE "cryptocurrencies" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "coinId" VARCHAR(50) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "currentPrice" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cryptocurrencies_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cryptocurrencies_coinId_key" UNIQUE ("coinId"),
    CONSTRAINT "cryptocurrencies_symbol_key" UNIQUE ("symbol")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "cryptocurrencyId" UUID NOT NULL,
    "alertType" "AlertType" NOT NULL,
    "targetPrice" DECIMAL(65,30) NOT NULL,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "triggeredPrice" DECIMAL(65,30),
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_cryptocurrencyId_fkey" FOREIGN KEY ("cryptocurrencyId") REFERENCES "cryptocurrencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default cryptocurrencies with NULL prices (will be updated by scheduler with real market prices)
INSERT INTO "cryptocurrencies" ("coinId", "symbol", "name", "currentPrice", "createdAt", "updatedAt") VALUES
('bitcoin', 'BTC', 'Bitcoin', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ethereum', 'ETH', 'Ethereum', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('binancecoin', 'BNB', 'BNB', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('solana', 'SOL', 'Solana', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cardano', 'ADA', 'Cardano', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ripple', 'XRP', 'XRP', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('polkadot', 'DOT', 'Polkadot', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dogecoin', 'DOGE', 'Dogecoin', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('matic-network', 'MATIC', 'Polygon', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('chainlink', 'LINK', 'Chainlink', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
