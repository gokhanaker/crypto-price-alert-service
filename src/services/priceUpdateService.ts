import axios from 'axios';
import { config } from '@/config/env';
import prisma from '@/config/database';
import { AlertService } from '@/services/alertService';
import { logger } from '@/services/loggerService';

export class PriceUpdateService {
  static async updateAllPrices(): Promise<void> {
    try {
      const cryptocurrencies = await prisma.cryptocurrency.findMany();

      if (cryptocurrencies.length === 0) {
        logger.warn('⚠️  No cryptocurrencies found in database');
        return;
      }

      const coinIds = cryptocurrencies.map((crypto: any) => crypto.coinId);
      const prices = await this.fetchPricesFromCoinGecko(coinIds);

      let updatedCount = 0;
      let alertChecks = 0;

      for (const crypto of cryptocurrencies) {
        const price = prices[crypto.coinId]?.usd;
        if (price && price > 0) {
          await prisma.cryptocurrency.update({
            where: { id: crypto.id },
            data: {
              currentPrice: price,
            },
          });

          await AlertService.checkAndTriggerAlerts(crypto.id, price);

          updatedCount++;
          alertChecks++;
        }
      }

      logger.info('✅ Price update completed', {
        totalCryptocurrencies: cryptocurrencies.length,
        updatedCount,
        alertChecks,
        successRate: `${((updatedCount / cryptocurrencies.length) * 100).toFixed(1)}%`,
      });
    } catch (error: any) {
      logger.error('❌ Error updating prices', {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  private static async fetchPricesFromCoinGecko(coinIds: string[]): Promise<any> {
    try {
      const response = await axios.get(`${config.coinGeckoApiUrl}/simple/price`, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'CryptoPriceAlertService/1.0',
          Accept: 'application/json',
        },
      });

      return response.data;
    } catch (error: any) {
      logger.warn('⚠️  Primary API endpoint failed, trying fallback', {
        error: error.message,
        coinCount: coinIds.length,
      });

      // Try fallback endpoint
      try {
        const fallbackResponse = await axios.get(`${config.coinGeckoApiUrl}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            ids: coinIds.join(','),
            order: 'market_cap_desc',
            per_page: 100,
            page: 1,
            sparkline: false,
          },
          timeout: 15000,
          headers: {
            'User-Agent': 'CryptoPriceAlertService/1.0',
            Accept: 'application/json',
          },
        });

        const fallbackData: any = {};
        fallbackResponse.data.forEach((coin: any) => {
          fallbackData[coin.id] = { usd: coin.current_price };
        });

        logger.info('✅ Successfully fetched prices from fallback endpoint', {
          coinCount: coinIds.length,
          responseStatus: fallbackResponse.status,
        });

        return fallbackData;
      } catch (fallbackError: any) {
        logger.error('❌ Both API endpoints failed', {
          primaryError: error.message,
          fallbackError: fallbackError.message,
          coinCount: coinIds.length,
        });
        throw new Error(`Failed to fetch prices from CoinGecko API: ${error.message}`);
      }
    }
  }
}
