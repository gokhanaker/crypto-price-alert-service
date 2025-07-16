import request from 'supertest';
import { createTestApp } from '../../test-utils/integrationSetup';

const app = createTestApp();

describe('Alert Integration', () => {
  it('should create an alert successfully', async () => {
    const alertData = {
      cryptocurrencyId: 'crypto-1',
      alertType: 'ABOVE',
      targetPrice: 100,
    };
    const response = await request(app).post('/api/alerts').send(alertData).expect(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('cryptocurrencyId', 'crypto-1');
    expect(response.body.data).toHaveProperty('alertType', 'ABOVE');
    expect(response.body.data).toHaveProperty('targetPrice', 100);
    expect(response.body).toHaveProperty('message', 'Alert created successfully');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should fetch user alerts successfully', async () => {
    const response = await request(app).get('/api/alerts').expect(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data[0]).toHaveProperty('cryptocurrencyId');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should update an alert successfully', async () => {
    const updateData = {
      targetPrice: 200,
      alertType: 'BELOW',
    };
    const response = await request(app).put('/api/alerts/alert-1').send(updateData).expect(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('targetPrice', 200);
    expect(response.body.data).toHaveProperty('alertType', 'BELOW');
    expect(response.body).toHaveProperty('message', 'Alert updated successfully');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');
  });

  it('should delete an alert successfully', async () => {
    const response = await request(app).delete('/api/alerts/alert-1').expect(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data', null);
    expect(response.body).toHaveProperty('message', 'Alert deleted successfully');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('requestId');
  });
});
