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
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBe('test-token');
    expect(response.body).toHaveProperty('message', 'User registered successfully');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should login a user successfully', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };
    const response = await request(app).post('/api/auth/login').send(loginData).expect(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('user');
    expect(response.body.data).toHaveProperty('token');
    expect(response.body.data.user.email).toBe('test@example.com');
    expect(response.body.data.token).toBe('test-token');
    expect(response.body).toHaveProperty('message', 'Login successful');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');
  });
});
