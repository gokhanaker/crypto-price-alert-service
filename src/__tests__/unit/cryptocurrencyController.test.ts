import { Request, Response } from 'express';
import { CryptocurrencyController } from '@/controllers/cryptocurrencyController';
import { CryptocurrencyService } from '@/services/cryptocurrencyService';
import { logger } from '@/services/loggerService';

// Mock the services
jest.mock('@/services/cryptocurrencyService');
jest.mock('@/services/loggerService');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('CryptocurrencyController', () => {
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
  });

  describe('getAllCryptocurrencies', () => {
    it('should return all cryptocurrencies', async () => {
      const mockCryptocurrencies = [
        {
          id: 'crypto-1',
          coinId: 'bitcoin',
          symbol: 'BTC',
          name: 'Bitcoin',
          currentPrice: '50000.00',
          updatedAt: new Date(),
        },
        {
          id: 'crypto-2',
          coinId: 'ethereum',
          symbol: 'ETH',
          name: 'Ethereum',
          currentPrice: null,
          updatedAt: new Date(),
        },
      ];

      (CryptocurrencyService.getAllCryptocurrencies as jest.Mock).mockResolvedValue(
        mockCryptocurrencies
      );

      const req: any = {};
      await CryptocurrencyController.getAllCryptocurrencies(req, res);

      expect(CryptocurrencyService.getAllCryptocurrencies).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        cryptocurrencies: mockCryptocurrencies,
      });
    });

    it('should handle empty cryptocurrency list', async () => {
      (CryptocurrencyService.getAllCryptocurrencies as jest.Mock).mockResolvedValue([]);

      const req: any = {};
      await CryptocurrencyController.getAllCryptocurrencies(req, res);

      expect(res.json).toHaveBeenCalledWith({
        cryptocurrencies: [],
      });
    });

    it('should handle service error and return 500', async () => {
      const error = new Error('Database connection failed');
      (CryptocurrencyService.getAllCryptocurrencies as jest.Mock).mockRejectedValue(error);

      const req: any = {};
      await CryptocurrencyController.getAllCryptocurrencies(req, res);

      expect(logger.error).toHaveBeenCalledWith('❌ Failed to fetch cryptocurrencies', {
        error: 'Database connection failed',
        stack: error.stack,
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch cryptocurrencies',
      });
    });
  });

  describe('getCryptocurrencyById', () => {
    it('should return cryptocurrency by ID', async () => {
      const mockCryptocurrency = {
        id: 'crypto-1',
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        currentPrice: '50000.00',
        updatedAt: new Date(),
      };

      (CryptocurrencyService.getCryptocurrencyById as jest.Mock).mockResolvedValue(
        mockCryptocurrency
      );

      const req: any = { params: { id: 'crypto-1' } };
      await CryptocurrencyController.getCryptocurrencyById(req, res);

      expect(CryptocurrencyService.getCryptocurrencyById).toHaveBeenCalledWith('crypto-1');
      expect(res.json).toHaveBeenCalledWith({
        cryptocurrency: mockCryptocurrency,
      });
    });

    it('should return cryptocurrency with null price', async () => {
      const mockCryptocurrency = {
        id: 'crypto-2',
        coinId: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        currentPrice: null,
        updatedAt: new Date(),
      };

      (CryptocurrencyService.getCryptocurrencyById as jest.Mock).mockResolvedValue(
        mockCryptocurrency
      );

      const req: any = { params: { id: 'crypto-2' } };
      await CryptocurrencyController.getCryptocurrencyById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        cryptocurrency: mockCryptocurrency,
      });
    });

    it('should return 404 when cryptocurrency not found', async () => {
      (CryptocurrencyService.getCryptocurrencyById as jest.Mock).mockResolvedValue(null);

      const req: any = { params: { id: 'nonexistent-id' } };
      await CryptocurrencyController.getCryptocurrencyById(req, res);

      expect(CryptocurrencyService.getCryptocurrencyById).toHaveBeenCalledWith('nonexistent-id');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cryptocurrency not found',
      });
    });

    it('should handle service error and return 500', async () => {
      const error = new Error('Database error');
      (CryptocurrencyService.getCryptocurrencyById as jest.Mock).mockRejectedValue(error);

      const req: any = { params: { id: 'crypto-1' } };
      await CryptocurrencyController.getCryptocurrencyById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to fetch cryptocurrency',
      });
    });

    it('should handle missing ID parameter', async () => {
      const req: any = { params: {} };
      await CryptocurrencyController.getCryptocurrencyById(req, res);

      expect(CryptocurrencyService.getCryptocurrencyById).toHaveBeenCalledWith(undefined);
    });
  });
});
