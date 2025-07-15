import { Request, Response } from 'express';
import { CryptocurrencyService } from '@/services/cryptocurrencyService';
import { logger } from '@/services/loggerService';

export class CryptocurrencyController {
  static async getAllCryptocurrencies(req: Request, res: Response) {
    try {
      const cryptocurrencies = await CryptocurrencyService.getAllCryptocurrencies();

      res.json({
        cryptocurrencies,
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

      res.json({
        cryptocurrency,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch cryptocurrency',
      });
    }
  }
}
