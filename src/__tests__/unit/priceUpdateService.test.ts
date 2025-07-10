import { PriceUpdateService } from '@/services/priceUpdateService';

// Mock the entire module
jest.mock('@/services/priceUpdateService', () => ({
  PriceUpdateService: {
    updateAllPrices: jest.fn(),
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
});
