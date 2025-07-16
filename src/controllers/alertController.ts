import { Request, Response } from 'express';
import { AlertService } from '@/services/alertService';
import { logger } from '@/services/loggerService';
import { AlertErrorCodes, createErrorResponse, createSuccessResponse } from '@/utils/errorResponse';

export class AlertController {
  static async createAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const alert = await AlertService.createAlert(userId, req.body);

      res.status(201).json(createSuccessResponse(req, alert, 'Alert created successfully'));
    } catch (error: any) {
      logger.error('Alert creation failed', {
        userId: (req as any).user?.id,
        error: error.message,
        stack: error.stack,
      });

      let statusCode = 500;
      let errorCode = AlertErrorCodes.INTERNAL_SERVER_ERROR;
      let message = 'Failed to create alert';

      if (error.message === 'Cryptocurrency not found') {
        statusCode = 400;
        errorCode = AlertErrorCodes.CRYPTOCURRENCY_NOT_FOUND;
        message = 'Invalid cryptocurrency specified';
      } else if (error.message.includes('validation')) {
        statusCode = 400;
        errorCode = AlertErrorCodes.VALIDATION_ERROR;
        message = 'Invalid alert data provided';
      }

      res.status(statusCode).json(createErrorResponse(req, errorCode, message, error.message));
    }
  }

  static async getUserAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const alerts = await AlertService.getUserAlerts(userId);

      res.json(createSuccessResponse(req, alerts));
    } catch (error: any) {
      logger.error('Failed to fetch user alerts', {
        userId: (req as any).user?.id,
        error: error.message,
        stack: error.stack,
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            req,
            AlertErrorCodes.DATABASE_ERROR,
            'Failed to fetch alerts',
            error.message
          )
        );
    }
  }

  static async getAlertById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const alert = await AlertService.getAlertById(id, userId);

      if (!alert) {
        return res
          .status(404)
          .json(createErrorResponse(req, AlertErrorCodes.ALERT_NOT_FOUND, 'Alert not found'));
      }

      res.json(createSuccessResponse(req, alert));
    } catch (error: any) {
      logger.error('Failed to fetch alert by ID', {
        alertId: req.params.id,
        userId: (req as any).user?.id,
        error: error.message,
        stack: error.stack,
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            req,
            AlertErrorCodes.DATABASE_ERROR,
            'Failed to fetch alert',
            error.message
          )
        );
    }
  }

  static async updateAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      const alert = await AlertService.updateAlert(id, userId, req.body);

      res.json(createSuccessResponse(req, alert, 'Alert updated successfully'));
    } catch (error: any) {
      logger.error('Alert update failed', {
        alertId: req.params.id,
        userId: (req as any).user?.id,
        error: error.message,
        stack: error.stack,
      });

      let statusCode = 500;
      let errorCode = AlertErrorCodes.INTERNAL_SERVER_ERROR;
      let message = 'Failed to update alert';

      if (error.message === 'Alert not found') {
        statusCode = 404;
        errorCode = AlertErrorCodes.ALERT_NOT_FOUND;
        message = 'Alert not found';
      } else if (error.message.includes('validation')) {
        statusCode = 400;
        errorCode = AlertErrorCodes.VALIDATION_ERROR;
        message = 'Invalid update data provided';
      }

      res.status(statusCode).json(createErrorResponse(req, errorCode, message, error.message));
    }
  }

  static async deleteAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { id } = req.params;

      await AlertService.deleteAlert(id, userId);

      res.json(createSuccessResponse(req, null, 'Alert deleted successfully'));
    } catch (error: any) {
      logger.error('Alert deletion failed', {
        alertId: req.params.id,
        userId: (req as any).user?.id,
        error: error.message,
        stack: error.stack,
      });

      let statusCode = 500;
      let errorCode = AlertErrorCodes.INTERNAL_SERVER_ERROR;
      let message = 'Failed to delete alert';

      if (error.message === 'Alert not found') {
        statusCode = 404;
        errorCode = AlertErrorCodes.ALERT_NOT_FOUND;
        message = 'Alert not found';
      }

      res.status(statusCode).json(createErrorResponse(req, errorCode, message, error.message));
    }
  }

  static async getTriggeredAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const triggeredAlerts = await AlertService.getUserTriggeredAlerts(userId);

      res.json(createSuccessResponse(req, triggeredAlerts));
    } catch (error: any) {
      logger.error('Failed to fetch triggered alerts', {
        userId: (req as any).user?.id,
        error: error.message,
        stack: error.stack,
      });

      res
        .status(500)
        .json(
          createErrorResponse(
            req,
            AlertErrorCodes.DATABASE_ERROR,
            'Failed to fetch triggered alerts',
            error.message
          )
        );
    }
  }
}
