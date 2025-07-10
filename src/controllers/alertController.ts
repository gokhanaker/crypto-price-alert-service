import { Request, Response } from 'express';
import { AlertService } from '@/services/alertService';

export class AlertController {
  static async createAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const alert = await AlertService.createAlert(userId, req.body);

      res.status(201).json({
        message: 'Alert created successfully',
        alert,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  static async getUserAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const alerts = await AlertService.getUserAlerts(userId);

      res.json({
        alerts,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch alerts',
      });
    }
  }

  static async getAlertById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const alert = await AlertService.getAlertById(id, userId);

      if (!alert) {
        return res.status(404).json({
          error: 'Alert not found',
        });
      }

      res.json({
        alert,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch alert',
      });
    }
  }

  static async updateAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const alert = await AlertService.updateAlert(id, userId, req.body);

      res.json({
        message: 'Alert updated successfully',
        alert,
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  static async deleteAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await AlertService.deleteAlert(id, userId);

      res.json({
        message: 'Alert deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        error: error.message,
      });
    }
  }

  static async getTriggeredAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const triggeredAlerts = await AlertService.getUserTriggeredAlerts(userId);

      res.json({
        triggeredAlerts,
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Failed to fetch triggered alerts',
      });
    }
  }
}
