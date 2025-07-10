import { CryptocurrencyService } from '@/services/cryptocurrencyService';

// Mock the entire module
jest.mock('@/services/cryptocurrencyService', () => ({
  CryptocurrencyService: {
    getAllCryptocurrencies: jest.fn(),
    getCryptocurrencyById: jest.fn(),
  },
}));

const mockedCryptocurrencyService = CryptocurrencyService as jest.Mocked<
  typeof CryptocurrencyService
>;

describe('CryptocurrencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCryptocurrencies', () => {
    it('should return all cryptocurrencies', async () => {
      const mockCryptocurrencies = [
        { id: '1', name: 'Bitcoin', coinId: 'bitcoin', symbol: 'BTC' },
        { id: '2', name: 'Ethereum', coinId: 'ethereum', symbol: 'ETH' },
      ] as any;
      mockedCryptocurrencyService.getAllCryptocurrencies.mockResolvedValue(mockCryptocurrencies);

      const result = await CryptocurrencyService.getAllCryptocurrencies();

      expect(result).toEqual(mockCryptocurrencies);
      expect(mockedCryptocurrencyService.getAllCryptocurrencies).toHaveBeenCalled();
    });
  });

  describe('getCryptocurrencyById', () => {
    it('should return cryptocurrency by id', async () => {
      const mockCrypto = { id: '1', name: 'Bitcoin', coinId: 'bitcoin' } as any;
      mockedCryptocurrencyService.getCryptocurrencyById.mockResolvedValue(mockCrypto);

      const result = await CryptocurrencyService.getCryptocurrencyById('1');

      expect(result).toEqual(mockCrypto);
      expect(mockedCryptocurrencyService.getCryptocurrencyById).toHaveBeenCalledWith('1');
    });

    it('should return null when not found', async () => {
      mockedCryptocurrencyService.getCryptocurrencyById.mockResolvedValue(null);

      const result = await CryptocurrencyService.getCryptocurrencyById('999');

      expect(result).toBeNull();
    });
  });
});
