import { AlertController } from '@/controllers/alertController';
import { AlertService } from '@/services/alertService';

jest.mock('@/services/alertService');

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('AlertController', () => {
  const userId = 'user-1';
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
  });

  it('createAlert: should create alert and return 201', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts',
    };

    (AlertService.createAlert as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    await AlertController.createAlert(req, res);
    expect(AlertService.createAlert).toHaveBeenCalledWith(userId, req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'alert-1' },
      message: 'Alert created successfully',
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('createAlert: should handle error', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts',
    };

    (AlertService.createAlert as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.createAlert(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'COMMON_INTERNAL_ERROR',
        message: 'Failed to create alert',
        details: 'fail',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts',
      },
      data: null,
    });
  });

  it('getUserAlerts: should return alerts', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts',
    };

    (AlertService.getUserAlerts as jest.Mock).mockResolvedValue([1, 2]);
    await AlertController.getUserAlerts(req, res);
    expect(AlertService.getUserAlerts).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [1, 2],
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('getUserAlerts: should handle error', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts',
    };

    (AlertService.getUserAlerts as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.getUserAlerts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'COMMON_DATABASE_ERROR',
        message: 'Failed to fetch alerts',
        details: 'fail',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts',
      },
      data: null,
    });
  });

  it('getAlertById: should return alert', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.getAlertById as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    await AlertController.getAlertById(req, res);
    expect(AlertService.getAlertById).toHaveBeenCalledWith('alert-1', userId);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'alert-1' },
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('getAlertById: should return 404 if not found', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.getAlertById as jest.Mock).mockResolvedValue(null);
    await AlertController.getAlertById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'ALERT_NOT_FOUND',
        message: 'Alert not found',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts/alert-1',
      },
      data: null,
    });
  });

  it('getAlertById: should handle error', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.getAlertById as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.getAlertById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'COMMON_DATABASE_ERROR',
        message: 'Failed to fetch alert',
        details: 'fail',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts/alert-1',
      },
      data: null,
    });
  });

  it('updateAlert: should update alert', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.updateAlert as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    await AlertController.updateAlert(req, res);
    expect(AlertService.updateAlert).toHaveBeenCalledWith('alert-1', userId, req.body);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'alert-1' },
      message: 'Alert updated successfully',
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('updateAlert: should handle error', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.updateAlert as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.updateAlert(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'COMMON_INTERNAL_ERROR',
        message: 'Failed to update alert',
        details: 'fail',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts/alert-1',
      },
      data: null,
    });
  });

  it('deleteAlert: should delete alert', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.deleteAlert as jest.Mock).mockResolvedValue(undefined);
    await AlertController.deleteAlert(req, res);
    expect(AlertService.deleteAlert).toHaveBeenCalledWith('alert-1', userId);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: null,
      message: 'Alert deleted successfully',
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('deleteAlert: should handle error', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/alert-1',
    };

    (AlertService.deleteAlert as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.deleteAlert(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'COMMON_INTERNAL_ERROR',
        message: 'Failed to delete alert',
        details: 'fail',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts/alert-1',
      },
      data: null,
    });
  });

  it('getTriggeredAlerts: should return triggered alerts', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/triggered',
    };

    (AlertService.getUserTriggeredAlerts as jest.Mock).mockResolvedValue([1, 2]);
    await AlertController.getTriggeredAlerts(req, res);
    expect(AlertService.getUserTriggeredAlerts).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [1, 2],
      timestamp: expect.any(String),
      requestId: expect.any(String),
    });
  });

  it('getTriggeredAlerts: should handle error', async () => {
    const req: any = {
      user: { id: userId },
      body: { foo: 'bar' },
      params: { id: 'alert-1' },
      path: '/api/alerts/triggered',
    };

    (AlertService.getUserTriggeredAlerts as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.getTriggeredAlerts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        code: 'COMMON_DATABASE_ERROR',
        message: 'Failed to fetch triggered alerts',
        details: 'fail',
        timestamp: expect.any(String),
        requestId: expect.any(String),
        path: '/api/alerts/triggered',
      },
      data: null,
    });
  });
});
