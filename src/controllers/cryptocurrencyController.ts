import { Request, Response } from 'express';
import { CryptocurrencyService } from '@/services/cryptocurrencyService';
import { logger } from '@/services/loggerService';

export class CryptocurrencyController {
  static async getAllCryptocurrencies(req: Request, res: Response) {
    logger.info('📊 Getting all cryptocurrencies');
    try {
      const cryptocurrencies = await CryptocurrencyService.getAllCryptocurrencies();

      // Add a helpful message for cryptocurrencies without prices
      const cryptocurrenciesWithStatus = cryptocurrencies.map(crypto => ({
        ...crypto,
        priceStatus: crypto.currentPrice ? 'available' : 'pending',
        message: crypto.currentPrice ? null : 'Price will be updated by the scheduler',
      }));

      logger.debug('✅ Retrieved cryptocurrencies', {
        count: cryptocurrencies.length,
        withPrices: cryptocurrencies.filter(c => c.currentPrice).length,
        withoutPrices: cryptocurrencies.filter(c => !c.currentPrice).length,
      });

      res.json({
        cryptocurrencies: cryptocurrenciesWithStatus,
        summary: {
          total: cryptocurrencies.length,
          withPrices: cryptocurrencies.filter(c => c.currentPrice).length,
          withoutPrices: cryptocurrencies.filter(c => !c.currentPrice).length,
        },
      });
    } catch (error: any) {
      logger.error('❌ Failed to fetch cryptocurrencies', {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        error: 'Failed to fetch cryptocurrencies',
      });
    }
  }

  static async getCryptocurrencyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cryptocurrency = await CryptocurrencyService.getCryptocurrencyById(id);

      if (!cryptocurrency) {
        return res.status(404).json({
          error: 'Cryptocurrency not found',
        });
      }

      // Add status information
      const response = {
        ...cryptocurrency,
        priceStatus: cryptocurrency.currentPrice ? 'available' : 'pending',
        message: cryptocurrency.currentPrice ? null : 'Price will be updated by the scheduler',
      };

      res.json({
        cryptocurrency: response,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch cryptocurrency',
      });
    }
  }
}
