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

# Run migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev

echo ""
echo "✅ Database setup completed!"
echo "📊 Database now contains 8 default cryptocurrencies"
echo "🚀 You can now start your server with: npm run dev"
echo "🔗 Check your database with: npm run db:studio" 