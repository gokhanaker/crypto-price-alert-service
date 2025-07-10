#!/bin/bash

echo "🚀 Crypto Price Alert Service - Database Setup"
echo "=============================================="

# Check if database is running
echo "🔍 Checking if database is running..."
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Database is not running. Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Waiting for database to be ready..."
    sleep 10
else
    echo "✅ Database is already running"
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations (this will apply the base_schema migration with 10 cryptocurrencies)
echo "🗄️ Running database migrations..."
npx prisma migrate dev

# Check if cryptocurrencies exist, if not, reset the database
echo "🔍 Checking if cryptocurrencies exist..."
CRYPTO_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCryptos() {
  try {
    const count = await prisma.cryptocurrency.count();
    console.log(count);
  } catch (error) {
    console.log('0');
  } finally {
    await prisma.\$disconnect();
  }
}

checkCryptos();
")

if [ "$CRYPTO_COUNT" -eq 0 ]; then
    echo "⚠️  No cryptocurrencies found. Resetting database..."
    npx prisma migrate reset --force
    echo "✅ Database reset complete with 10 cryptocurrencies"
else
    echo "✅ Found $CRYPTO_COUNT cryptocurrencies in database"
fi

echo ""
echo "✅ Database setup completed!"
echo "📊 Database now contains 10 default cryptocurrencies"
echo "🚀 You can now start your server with: npm run dev"
echo "🔗 Check your database with: npm run db:studio"
