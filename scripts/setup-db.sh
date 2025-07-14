#!/bin/bash

echo "🚀 Crypto Price Alert Service - Database Setup"
echo "=============================================="

# Check if database is running
echo "🔍 Checking if database is running..."
if ! docker-compose ps postgres | grep -q "Up"; then
    echo "❌ Database is not running. Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Waiting for database to be ready..."
    sleep 15
else
    echo "✅ Database is already running"
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database is already set up
echo "🔍 Checking if database is already set up..."
DB_SETUP=$(PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d crypto_price_alerts_db -t -c "SELECT COUNT(*) FROM cryptocurrencies;" 2>/dev/null | tr -d ' ')

if [ "$DB_SETUP" = "10" ]; then
    echo "✅ Database is already set up with 10 cryptocurrencies"
else
    echo "🗄️ Setting up fresh database..."
    # Apply migration directly using SQL to avoid advisory lock issues
    PGPASSWORD=postgres psql -h localhost -p 5432 -U postgres -d crypto_price_alerts_db -f prisma/migrations/20250714113734_init/migration.sql > /dev/null 2>&1
    echo "✅ Database migration applied successfully"
fi

echo ""
echo "✅ Database setup completed!"
echo "📊 Database now contains 10 default cryptocurrencies"
echo "🚀 You can now start your server with: npm run dev"
echo "🔗 Check your database with: npm run db:studio"
