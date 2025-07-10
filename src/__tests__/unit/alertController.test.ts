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
  const req: any = { user: { id: userId }, body: { foo: 'bar' }, params: { id: 'alert-1' } };
  let res: any;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
  });

  it('createAlert: should create alert and return 201', async () => {
    (AlertService.createAlert as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    await AlertController.createAlert(req, res);
    expect(AlertService.createAlert).toHaveBeenCalledWith(userId, req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Alert created successfully',
      alert: { id: 'alert-1' },
    });
  });

  it('createAlert: should handle error', async () => {
    (AlertService.createAlert as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.createAlert(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });

  it('getUserAlerts: should return alerts', async () => {
    (AlertService.getUserAlerts as jest.Mock).mockResolvedValue([1, 2]);
    await AlertController.getUserAlerts(req, res);
    expect(AlertService.getUserAlerts).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({ alerts: [1, 2] });
  });

  it('getUserAlerts: should handle error', async () => {
    (AlertService.getUserAlerts as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.getUserAlerts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch alerts' });
  });

  it('getAlertById: should return alert', async () => {
    (AlertService.getAlertById as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    await AlertController.getAlertById(req, res);
    expect(AlertService.getAlertById).toHaveBeenCalledWith('alert-1', userId);
    expect(res.json).toHaveBeenCalledWith({ alert: { id: 'alert-1' } });
  });

  it('getAlertById: should return 404 if not found', async () => {
    (AlertService.getAlertById as jest.Mock).mockResolvedValue(null);
    await AlertController.getAlertById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Alert not found' });
  });

  it('getAlertById: should handle error', async () => {
    (AlertService.getAlertById as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.getAlertById(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch alert' });
  });

  it('updateAlert: should update alert', async () => {
    (AlertService.updateAlert as jest.Mock).mockResolvedValue({ id: 'alert-1' });
    await AlertController.updateAlert(req, res);
    expect(AlertService.updateAlert).toHaveBeenCalledWith('alert-1', userId, req.body);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Alert updated successfully',
      alert: { id: 'alert-1' },
    });
  });

  it('updateAlert: should handle error', async () => {
    (AlertService.updateAlert as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.updateAlert(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });

  it('deleteAlert: should delete alert', async () => {
    (AlertService.deleteAlert as jest.Mock).mockResolvedValue(undefined);
    await AlertController.deleteAlert(req, res);
    expect(AlertService.deleteAlert).toHaveBeenCalledWith('alert-1', userId);
    expect(res.json).toHaveBeenCalledWith({ message: 'Alert deleted successfully' });
  });

  it('deleteAlert: should handle error', async () => {
    (AlertService.deleteAlert as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.deleteAlert(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
  });

  it('getTriggeredAlerts: should return triggered alerts', async () => {
    (AlertService.getUserTriggeredAlerts as jest.Mock).mockResolvedValue([1, 2]);
    await AlertController.getTriggeredAlerts(req, res);
    expect(AlertService.getUserTriggeredAlerts).toHaveBeenCalledWith(userId);
    expect(res.json).toHaveBeenCalledWith({ triggeredAlerts: [1, 2] });
  });

  it('getTriggeredAlerts: should handle error', async () => {
    (AlertService.getUserTriggeredAlerts as jest.Mock).mockRejectedValue(new Error('fail'));
    await AlertController.getTriggeredAlerts(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch triggered alerts' });
  });
});
