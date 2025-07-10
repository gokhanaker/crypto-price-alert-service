import request from 'supertest';
import { createTestApp } from '../../test-utils/integrationSetup';

const app = createTestApp();

describe('Alert Integration (Simple)', () => {
  it('should create an alert successfully', async () => {
    const alertData = {
      cryptocurrencyId: 'crypto-1',
      alertType: 'ABOVE',
      targetPrice: 100,
    };
    const response = await request(app).post('/api/alerts').send(alertData).expect(201);
    expect(response.body).toHaveProperty('alert');
    expect(response.body.alert.cryptocurrencyId).toBe('crypto-1');
    expect(response.body.alert.alertType).toBe('ABOVE');
    expect(response.body.alert.targetPrice).toBe(100);
  });

  it('should fetch user alerts successfully', async () => {
    const response = await request(app).get('/api/alerts').expect(200);
    expect(response.body).toHaveProperty('alerts');
    expect(Array.isArray(response.body.alerts)).toBe(true);
    expect(response.body.alerts.length).toBeGreaterThanOrEqual(1);
    expect(response.body.alerts[0]).toHaveProperty('cryptocurrencyId');
  });

  it('should update an alert successfully', async () => {
    const updateData = {
      targetPrice: 200,
      alertType: 'BELOW',
    };
    const response = await request(app).put('/api/alerts/alert-1').send(updateData).expect(200);
    expect(response.body).toHaveProperty('alert');
    expect(response.body.alert.targetPrice).toBe(200);
    expect(response.body.alert.alertType).toBe('BELOW');
  });

  it('should delete an alert successfully', async () => {
    const response = await request(app).delete('/api/alerts/alert-1').expect(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toBe('Alert deleted successfully');
  });
});
