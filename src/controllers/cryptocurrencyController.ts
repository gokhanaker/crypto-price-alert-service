import { Request, Response } from 'express';
import { CryptocurrencyService } from '@/services/cryptocurrencyService';
import { logger } from '@/services/loggerService';
import { AlertErrorCodes, createErrorResponse, createSuccessResponse } from '@/utils/errorResponse';

export class CryptocurrencyController {
  static async getAllCryptocurrencies(req: Request, res: Response) {
    try {
      const cryptocurrencies = await CryptocurrencyService.getAllCryptocurrencies();

      res.json(createSuccessResponse(req, cryptocurrencies));
    } catch (error: any) {
      logger.error('Failed to fetch cryptocurrencies', {
        error: error.message,
        stack: error.stack,
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            req,
            AlertErrorCodes.DATABASE_ERROR,
            'Failed to fetch cryptocurrencies',
            error.message
          )
        );
    }
  }

  static async getCryptocurrencyById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cryptocurrency = await CryptocurrencyService.getCryptocurrencyById(id);

      if (!cryptocurrency) {
        return res
          .status(404)
          .json(
            createErrorResponse(
              req,
              AlertErrorCodes.CRYPTOCURRENCY_NOT_FOUND,
              'Cryptocurrency not found'
            )
          );
      }

      res.json(createSuccessResponse(req, cryptocurrency));
    } catch (error: any) {
      logger.error('Failed to fetch cryptocurrency by ID', {
        cryptocurrencyId: req.params.id,
        error: error.message,
        stack: error.stack,
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            req,
            AlertErrorCodes.DATABASE_ERROR,
            'Failed to fetch cryptocurrency',
            error.message
          )
        );
    }
  }
}
