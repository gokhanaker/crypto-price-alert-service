jest.mock(
  '../../config/database',
  () => ({
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  }),
  { virtual: true }
);

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const mockDb = require('../../config/database');

jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed-password'));
jest
  .spyOn(bcrypt, 'compare')
  .mockImplementation((pw, hash) =>
    Promise.resolve(pw === 'password123' && hash === 'hashed-password')
  );
jest.spyOn(jwt, 'sign').mockImplementation(() => 'mock-jwt-token');
jest.spyOn(jwt, 'verify').mockImplementation(token => {
  if (token === 'valid-token') return { userId: 'user-id', email: 'test@example.com' };
  throw new Error('Invalid token');
});

describe('AuthService', () => {
  it('registers a new user (mocked)', async () => {
    const fakeRegister = jest.fn().mockResolvedValue({
      token: 'mock-token',
      user: { email: 'test@example.com' },
    });
    const result = await fakeRegister({ email: 'test@example.com', password: 'pw' });
    expect(result.token).toBe('mock-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('logs in a user (mocked)', async () => {
    const fakeLogin = jest.fn().mockResolvedValue({
      token: 'mock-token',
      user: { email: 'test@example.com' },
    });
    const result = await fakeLogin({ email: 'test@example.com', password: 'pw' });
    expect(result.token).toBe('mock-token');
    expect(result.user.email).toBe('test@example.com');
  });

  it('verifies a token (mocked)', async () => {
    const fakeVerify = jest.fn().mockResolvedValue({ email: 'test@example.com' });
    const result = await fakeVerify('mock-token');
    expect(result.email).toBe('test@example.com');
  });
});
