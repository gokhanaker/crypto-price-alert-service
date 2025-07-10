import { PriceUpdateService } from '@/services/priceUpdateService';

// Mock the entire module
jest.mock('@/services/priceUpdateService', () => ({
  PriceUpdateService: {
    updateAllPrices: jest.fn(),
    updatePricesForCryptocurrencies: jest.fn(),
    getPriceUpdateStatus: jest.fn(),
    getRealTimePrices: jest.fn(),
    updateAndGetRealTimePrices: jest.fn(),
  },
}));

const mockedPriceUpdateService = PriceUpdateService as jest.Mocked<typeof PriceUpdateService>;

describe('PriceUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAllPrices', () => {
    it('should update all prices successfully', async () => {
      mockedPriceUpdateService.updateAllPrices.mockResolvedValue(undefined);

      await PriceUpdateService.updateAllPrices();

      expect(mockedPriceUpdateService.updateAllPrices).toHaveBeenCalled();
    });

    it('should handle errors during update', async () => {
      mockedPriceUpdateService.updateAllPrices.mockRejectedValue(new Error('Update failed'));

      await expect(PriceUpdateService.updateAllPrices()).rejects.toThrow('Update failed');
    });
  });

  describe('updatePricesForCryptocurrencies', () => {
    it('should update prices for specific cryptocurrencies', async () => {
      const coinIds = ['bitcoin', 'ethereum'];
      mockedPriceUpdateService.updatePricesForCryptocurrencies.mockResolvedValue(undefined);

      await PriceUpdateService.updatePricesForCryptocurrencies(coinIds);

      expect(mockedPriceUpdateService.updatePricesForCryptocurrencies).toHaveBeenCalledWith(
        coinIds
      );
    });

    it('should handle errors for specific cryptocurrencies', async () => {
      const coinIds = ['bitcoin'];
      mockedPriceUpdateService.updatePricesForCryptocurrencies.mockRejectedValue(
        new Error('Failed to update cryptocurrency prices')
      );

      await expect(PriceUpdateService.updatePricesForCryptocurrencies(coinIds)).rejects.toThrow(
        'Failed to update cryptocurrency prices'
      );
    });
  });

  describe('getPriceUpdateStatus', () => {
    it('should return price update status', async () => {
      const mockStatus = {
        lastUpdate: new Date(),
        totalCryptocurrencies: 10,
        updatedCount: 8,
        successRate: '80%',
      };
      mockedPriceUpdateService.getPriceUpdateStatus.mockResolvedValue(mockStatus);

      const result = await PriceUpdateService.getPriceUpdateStatus();

      expect(result).toEqual(mockStatus);
      expect(mockedPriceUpdateService.getPriceUpdateStatus).toHaveBeenCalled();
    });
  });

  describe('getRealTimePrices', () => {
    it('should return real-time prices for all cryptocurrencies', async () => {
      const mockPrices = {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 },
      };
      mockedPriceUpdateService.getRealTimePrices.mockResolvedValue(mockPrices);

      const result = await PriceUpdateService.getRealTimePrices();

      expect(result).toEqual(mockPrices);
      expect(mockedPriceUpdateService.getRealTimePrices).toHaveBeenCalled();
    });

    it('should return real-time prices for specific cryptocurrencies', async () => {
      const coinIds = ['bitcoin', 'ethereum'];
      const mockPrices = {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 },
      };
      mockedPriceUpdateService.getRealTimePrices.mockResolvedValue(mockPrices);

      const result = await PriceUpdateService.getRealTimePrices(coinIds);

      expect(result).toEqual(mockPrices);
      expect(mockedPriceUpdateService.getRealTimePrices).toHaveBeenCalledWith(coinIds);
    });
  });

  describe('updateAndGetRealTimePrices', () => {
    it('should update and return real-time prices', async () => {
      const mockResult = {
        updatedPrices: {
          bitcoin: { usd: 50000 },
          ethereum: { usd: 3000 },
        },
        updateStats: {
          totalCryptocurrencies: 2,
          updatedCount: 2,
          successRate: '100%',
        },
      };
      mockedPriceUpdateService.updateAndGetRealTimePrices.mockResolvedValue(mockResult);

      const result = await PriceUpdateService.updateAndGetRealTimePrices();

      expect(result).toEqual(mockResult);
      expect(mockedPriceUpdateService.updateAndGetRealTimePrices).toHaveBeenCalled();
    });

    it('should handle errors during update and get', async () => {
      mockedPriceUpdateService.updateAndGetRealTimePrices.mockRejectedValue(
        new Error('Failed to update and get prices')
      );

      await expect(PriceUpdateService.updateAndGetRealTimePrices()).rejects.toThrow(
        'Failed to update and get prices'
      );
    });
  });
});
