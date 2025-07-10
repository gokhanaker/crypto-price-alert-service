#!/bin/bash

echo "🚀 Setting up Crypto Price Alert Service Database..."

# Run database migrations
echo "📊 Running database migrations..."
npm run db:migrate

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Optional: Fetch real prices and update the database
echo "💰 Fetching real cryptocurrency prices..."
node -e "
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function updatePrices() {
  try {
    const cryptocurrencies = await prisma.cryptocurrency.findMany();
    const coinIds = cryptocurrencies.map(crypto => crypto.coinId);
    
    console.log('Fetching prices for:', coinIds.join(', '));
    
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
      params: {
        ids: coinIds.join(','),
        vs_currencies: 'usd'
      }
    });
    
    const prices = response.data;
    
    for (const crypto of cryptocurrencies) {
      const price = prices[crypto.coinId]?.usd;
      if (price) {
        await prisma.cryptocurrency.update({
          where: { id: crypto.id },
          data: {
            currentPrice: price,
            lastUpdated: new Date()
          }
        });
        console.log(`✅ Updated ${crypto.name} price to $${price}`);
      } else {
        console.log(`⚠️  No price data for ${crypto.name}`);
      }
    }
    
    console.log('✅ All prices updated successfully!');
  } catch (error) {
    console.error('❌ Error updating prices:', error.message);
    console.log('⚠️  Using default prices from migration...');
  } finally {
    await prisma.$disconnect();
  }
}

updatePrices();
"

echo "✅ Database setup complete!"
echo "🎉 Crypto Price Alert Service is ready to use!" 