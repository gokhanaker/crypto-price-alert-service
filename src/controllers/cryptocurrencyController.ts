import { Request, Response } from 'express';
import { CryptocurrencyService } from '@/services/cryptocurrencyService';
import { logger } from '@/services/loggerService';

export class CryptocurrencyController {
  static async getAllCryptocurrencies(req: Request, res: Response) {
    try {
      const cryptocurrencies = await CryptocurrencyService.getAllCryptocurrencies();

      const cryptocurrenciesWithStatus = cryptocurrencies.map(crypto => ({
        ...crypto,
        priceStatus: crypto.currentPrice ? 'available' : 'pending',
        message: crypto.currentPrice ? null : 'Price will be updated by the scheduler',
      }));

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
