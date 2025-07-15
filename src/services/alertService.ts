import prisma from '@/config/database';
import { Alert, CreateAlertRequest, UpdateAlertRequest, AlertWithDetails } from '@/types';
import { CryptocurrencyService } from '@/services/cryptocurrencyService';
import { EventService } from '@/services/eventService';
import { AlertTriggeredEvent } from '@/types';
import { logger } from '@/services/loggerService';

export class AlertService {
  static async createAlert(userId: string, alertData: CreateAlertRequest): Promise<Alert> {
    const { cryptocurrencyId, alertType, targetPrice } = alertData;

    const cryptocurrency = await CryptocurrencyService.getCryptocurrencyById(cryptocurrencyId);
    if (!cryptocurrency) {
      logger.error('❌ Cryptocurrency not found for alert creation', {
        userId,
        cryptocurrencyId,
      });
      throw new Error('Cryptocurrency not found');
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        cryptocurrencyId,
        alertType,
        targetPrice,
      },
    });

    logger.info('✅ Alert created successfully', {
      alertId: alert.id,
      userId,
      cryptocurrencyId,
      alertType,
      targetPrice,
    });

    return alert;
  }

  static async getUserAlerts(userId: string): Promise<AlertWithDetails[]> {
    const alerts = (await prisma.alert.findMany({
      where: { userId },
      include: {
        cryptocurrency: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as AlertWithDetails[];

    logger.info('✅ Fetched user alerts', { userId, count: alerts.length });

    return alerts;
  }

  static async getAlertById(alertId: string, userId: string): Promise<AlertWithDetails | null> {
    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId,
      },
      include: {
        cryptocurrency: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
    });

    logger.info('✅ Fetched alert by ID', {
      alertId,
      userId,
    });

    return alert;
  }

  static async updateAlert(
    alertId: string,
    userId: string,
    updateData: UpdateAlertRequest
  ): Promise<Alert> {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      logger.error('❌ Alert not found for update', { alertId, userId });
      throw new Error('Alert not found');
    }

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: updateData,
    });

    logger.info('✅ Alert updated successfully', { alertId, userId });

    return alert;
  }

  static async deleteAlert(alertId: string, userId: string): Promise<void> {
    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!alert) {
      logger.error('❌ Alert not found for deletion', { alertId, userId });
      throw new Error('Alert not found');
    }

    await prisma.alert.delete({
      where: { id: alertId },
    });

    logger.info('✅ Alert deleted successfully', { alertId, userId });
  }

  static async checkAndTriggerAlerts(
    cryptocurrencyId: string,
    currentPrice: number
  ): Promise<void> {
    try {
      const alerts = await prisma.alert.findMany({
        where: {
          cryptocurrencyId,
          isTriggered: false, // Only check untriggered alerts
        },
        include: {
          cryptocurrency: true,
          user: true,
        },
      });

      const triggeredAlerts = [];

      for (const alert of alerts) {
        const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);

        if (shouldTrigger) {
          triggeredAlerts.push(alert);
          logger.info('🚨 Alert should be triggered', {
            alertId: alert.id,
            userId: alert.userId,
            alertType: alert.alertType,
            targetPrice: alert.targetPrice,
            currentPrice,
          });
        }
      }

      if (triggeredAlerts.length > 0) {
        await this.processTriggeredAlerts(triggeredAlerts, currentPrice);
      }
    } catch (error) {
      logger.error('❌ Error checking alerts', {
        cryptocurrencyId,
        currentPrice,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private static shouldTriggerAlert(alert: any, currentPrice: number): boolean {
    const targetPrice = parseFloat(alert.targetPrice.toString());

    switch (alert.alertType) {
      case 'ABOVE':
        return currentPrice >= targetPrice;
      case 'BELOW':
        return currentPrice <= targetPrice;
      default:
        return false;
    }
  }

  private static async processTriggeredAlerts(alerts: any[], currentPrice: number): Promise<void> {
    const triggerPromises = alerts.map(async alert => {
      try {
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            isTriggered: true,
            triggeredPrice: currentPrice,
            triggeredAt: new Date(),
          },
        });

        logger.info('✅ Alert updated with trigger information', {
          alertId: alert.id,
          userId: alert.userId,
          triggeredPrice: currentPrice,
        });

        const eventData: AlertTriggeredEvent = {
          alertId: alert.id,
          userId: alert.userId,
          cryptocurrencyId: alert.cryptocurrencyId,
          cryptocurrencySymbol: alert.cryptocurrency.symbol,
          cryptocurrencyName: alert.cryptocurrency.name,
          alertType: alert.alertType,
          targetPrice: parseFloat(alert.targetPrice.toString()),
          triggeredPrice: currentPrice,
          triggeredAt: new Date(),
          userEmail: alert.user.email,
          userName: alert.user.firstName || alert.user.email,
        };

        EventService.emitAlertTriggered(eventData);

        logger.info('📡 Event emitted for alert', {
          alertId: alert.id,
          userId: alert.userId,
        });
      } catch (error) {
        logger.error('❌ Failed to process triggered alert', {
          alertId: alert.id,
          userId: alert.userId,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    });

    await Promise.all(triggerPromises);
  }

  static async getUserTriggeredAlerts(userId: string): Promise<AlertWithDetails[]> {
    const alerts = (await prisma.alert.findMany({
      where: {
        userId,
        isTriggered: true,
      },
      include: {
        cryptocurrency: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
          },
        },
      },
      orderBy: { triggeredAt: 'desc' },
    })) as AlertWithDetails[];

    return alerts;
  }
}
