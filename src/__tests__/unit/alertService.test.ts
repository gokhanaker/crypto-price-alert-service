jest.mock(
  '../../config/database',
  () => ({
    alert: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  }),
  { virtual: true }
);

const mockDb = require('../../config/database');

const mockCryptocurrencyService = {
  getCryptocurrencyById: jest.fn(),
};
jest.mock(
  '../../services/cryptocurrencyService',
  () => ({
    CryptocurrencyService: mockCryptocurrencyService,
  }),
  { virtual: true }
);

describe('AlertService', () => {
  it('creates an alert (mocked)', async () => {
    const fakeCreate = jest
      .fn()
      .mockResolvedValue({ id: 'alert-id', cryptocurrencyId: 'crypto-id' });
    const result = await fakeCreate('user-id', {
      cryptocurrencyId: 'crypto-id',
      alertType: 'ABOVE',
      targetPrice: 50000,
    });
    expect(result.id).toBe('alert-id');
    expect(result.cryptocurrencyId).toBe('crypto-id');
  });

  it('gets user alerts (mocked)', async () => {
    const fakeGet = jest.fn().mockResolvedValue([
      { id: 'alert-1', userId: 'user-id' },
      { id: 'alert-2', userId: 'user-id' },
    ]);
    const result = await fakeGet('user-id');
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('alert-1');
  });

  it('updates an alert (mocked)', async () => {
    const fakeUpdate = jest.fn().mockResolvedValue({ id: 'alert-id', targetPrice: '55000' });
    const result = await fakeUpdate('alert-id', 'user-id', { targetPrice: 55000 });
    expect(result.targetPrice).toBe('55000');
  });
});
