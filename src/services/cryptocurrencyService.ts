import axios from 'axios';
import { config } from '@/config/env';
import prisma from '@/config/database';
import { Cryptocurrency, CoinGeckoPrice, CoinGeckoCoin } from '@/types';
import { logger } from '@/services/loggerService';

export class CryptocurrencyService {
  static async fetchPrices(coinIds: string[]): Promise<CoinGeckoPrice> {
    try {
      const response = await axios.get(`${config.coinGeckoApiUrl}/simple/price`, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch prices from CoinGecko API');
    }
  }

  static async getAllCryptocurrencies(): Promise<Cryptocurrency[]> {
    return await prisma.cryptocurrency.findMany({
      orderBy: { name: 'asc' },
    });
  }

  static async getCryptocurrencyById(id: string): Promise<Cryptocurrency | null> {
    return await prisma.cryptocurrency.findUnique({
      where: { id },
    });
  }

  static async getCryptocurrencyByCoinId(coinId: string): Promise<Cryptocurrency | null> {
    return await prisma.cryptocurrency.findUnique({
      where: { coinId },
    });
  }

  static async updatePrices(): Promise<void> {
    try {
      logger.info('🔄 Updating cryptocurrency prices');

      const cryptocurrencies = await prisma.cryptocurrency.findMany();

      if (cryptocurrencies.length === 0) {
        logger.warn('⚠️  No cryptocurrencies found in database');
        return;
      }

      logger.debug('📊 Found cryptocurrencies to update', {
        count: cryptocurrencies.length,
      });

      const coinIds = cryptocurrencies.map((crypto: Cryptocurrency) => crypto.coinId);
      const prices = await this.fetchPrices(coinIds);

      const updatePromises = cryptocurrencies.map(async (crypto: Cryptocurrency) => {
        const price = prices[crypto.coinId]?.usd;
        if (price) {
          await prisma.cryptocurrency.update({
            where: { id: crypto.id },
            data: {
              currentPrice: price,
              lastUpdated: new Date(),
            },
          });
        }
      });

      await Promise.all(updatePromises);

      logger.info('✅ Cryptocurrency prices updated successfully', {
        count: cryptocurrencies.length,
      });
    } catch (error) {
      logger.error('❌ Failed to update cryptocurrency prices', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error('Failed to update cryptocurrency prices');
    }
  }

  static async addCryptocurrency(coinData: CoinGeckoCoin): Promise<Cryptocurrency> {
    const existingCrypto = await prisma.cryptocurrency.findUnique({
      where: { coinId: coinData.id },
    });

    if (existingCrypto) {
      throw new Error('Cryptocurrency already exists');
    }

    return await prisma.cryptocurrency.create({
      data: {
        coinId: coinData.id,
        symbol: coinData.symbol.toUpperCase(),
        name: coinData.name,
        currentPrice: coinData.current_price,
        lastUpdated: new Date(coinData.last_updated),
      },
    });
  }
}
