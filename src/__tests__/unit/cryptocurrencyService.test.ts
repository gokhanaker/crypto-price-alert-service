import { CryptocurrencyService } from '@/services/cryptocurrencyService';

// Mock the entire module
jest.mock('@/services/cryptocurrencyService', () => ({
  CryptocurrencyService: {
    fetchPrices: jest.fn(),
    getAllCryptocurrencies: jest.fn(),
    getCryptocurrencyById: jest.fn(),
    getCryptocurrencyByCoinId: jest.fn(),
    updatePrices: jest.fn(),
    addCryptocurrency: jest.fn(),
  },
}));

const mockedCryptocurrencyService = CryptocurrencyService as jest.Mocked<
  typeof CryptocurrencyService
>;

describe('CryptocurrencyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPrices', () => {
    it('should fetch prices successfully', async () => {
      const mockPrices = {
        bitcoin: { usd: 50000 },
        ethereum: { usd: 3000 },
      };
      mockedCryptocurrencyService.fetchPrices.mockResolvedValue(mockPrices);

      const result = await CryptocurrencyService.fetchPrices(['bitcoin', 'ethereum']);

      expect(result).toEqual(mockPrices);
      expect(mockedCryptocurrencyService.fetchPrices).toHaveBeenCalledWith(['bitcoin', 'ethereum']);
    });

    it('should handle API errors', async () => {
      mockedCryptocurrencyService.fetchPrices.mockRejectedValue(new Error('API Error'));

      await expect(CryptocurrencyService.fetchPrices(['bitcoin'])).rejects.toThrow('API Error');
    });
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

  describe('getCryptocurrencyByCoinId', () => {
    it('should return cryptocurrency by coinId', async () => {
      const mockCrypto = { id: '1', name: 'Bitcoin', coinId: 'bitcoin' } as any;
      mockedCryptocurrencyService.getCryptocurrencyByCoinId.mockResolvedValue(mockCrypto);

      const result = await CryptocurrencyService.getCryptocurrencyByCoinId('bitcoin');

      expect(result).toEqual(mockCrypto);
      expect(mockedCryptocurrencyService.getCryptocurrencyByCoinId).toHaveBeenCalledWith('bitcoin');
    });
  });

  describe('updatePrices', () => {
    it('should update prices successfully', async () => {
      mockedCryptocurrencyService.updatePrices.mockResolvedValue(undefined);

      await CryptocurrencyService.updatePrices();

      expect(mockedCryptocurrencyService.updatePrices).toHaveBeenCalled();
    });

    it('should handle errors during update', async () => {
      mockedCryptocurrencyService.updatePrices.mockRejectedValue(new Error('Update failed'));

      await expect(CryptocurrencyService.updatePrices()).rejects.toThrow('Update failed');
    });
  });

  describe('addCryptocurrency', () => {
    it('should add new cryptocurrency successfully', async () => {
      const mockCoinData = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 50000,
        last_updated: '2023-01-01T00:00:00Z',
      };
      const mockCreatedCrypto = {
        id: '1',
        coinId: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        currentPrice: 50000,
        lastUpdated: new Date('2023-01-01T00:00:00Z'),
      } as any;

      mockedCryptocurrencyService.addCryptocurrency.mockResolvedValue(mockCreatedCrypto);

      const result = await CryptocurrencyService.addCryptocurrency(mockCoinData);

      expect(result).toEqual(mockCreatedCrypto);
      expect(mockedCryptocurrencyService.addCryptocurrency).toHaveBeenCalledWith(mockCoinData);
    });

    it('should handle duplicate cryptocurrency error', async () => {
      const mockCoinData = {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 50000,
        last_updated: '2023-01-01T00:00:00Z',
      };

      mockedCryptocurrencyService.addCryptocurrency.mockRejectedValue(
        new Error('Cryptocurrency already exists')
      );

      await expect(CryptocurrencyService.addCryptocurrency(mockCoinData)).rejects.toThrow(
        'Cryptocurrency already exists'
      );
    });
  });
});
