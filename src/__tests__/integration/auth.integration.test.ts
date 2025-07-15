import request from 'supertest';
import { createTestApp } from '../../test-utils/integrationSetup';

const app = createTestApp();

describe('Auth Integration', () => {
  it('should register a user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };
    const response = await request(app).post('/api/auth/register').send(userData).expect(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBe('test-token');
  });

  it('should login a user successfully', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const response = await request(app).post('/api/auth/login').send(loginData).expect(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
    expect(response.body.token).toBe('test-token');
  });
});
