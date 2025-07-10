import prisma from "@/config/database";
import {
  Alert,
  CreateAlertRequest,
  UpdateAlertRequest,
  AlertWithDetails,
} from "@/types";
import { CryptocurrencyService } from "@/services/cryptocurrencyService";
import { EventService, AlertTriggeredEvent } from "@/services/eventService";
import { logger } from "@/services/loggerService";

export class AlertService {
  static async createAlert(
    userId: string,
    alertData: CreateAlertRequest
  ): Promise<Alert> {
    const { cryptocurrencyId, alertType, targetPrice } = alertData;

    logger.info("🔔 Creating new alert", {
      userId,
      cryptocurrencyId,
      alertType,
      targetPrice,
    });

    const cryptocurrency = await CryptocurrencyService.getCryptocurrencyById(
      cryptocurrencyId
    );
    if (!cryptocurrency) {
      logger.error("❌ Cryptocurrency not found for alert creation", {
        userId,
        cryptocurrencyId,
      });
      throw new Error("Cryptocurrency not found");
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        cryptocurrencyId,
        alertType,
        targetPrice,
      },
    });

    logger.info("✅ Alert created successfully", {
      alertId: alert.id,
      userId,
      cryptocurrencyId,
      alertType,
      targetPrice,
    });

    return alert;
  }

  static async getUserAlerts(userId: string): Promise<AlertWithDetails[]> {
    logger.debug("📋 Getting user alerts", { userId });

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
            updatedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })) as AlertWithDetails[];

    logger.debug("✅ User alerts retrieved", {
      userId,
      alertCount: alerts.length,
    });

    return alerts;
  }

  static async getAlertById(
    alertId: string,
    userId: string
  ): Promise<AlertWithDetails | null> {
    logger.debug("🔍 Getting alert by ID", { alertId, userId });

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
            updatedAt: true,
          },
        },
      },
    });

    if (alert) {
      logger.debug("✅ Alert found by ID", { alertId, userId });
    } else {
      logger.debug("❌ Alert not found by ID", { alertId, userId });
    }

    return alert;
  }

  static async updateAlert(
    alertId: string,
    userId: string,
    updateData: UpdateAlertRequest
  ): Promise<Alert> {
    logger.info("✏️ Updating alert", { alertId, userId, updateData });

    const existingAlert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!existingAlert) {
      logger.error("❌ Alert not found for update", { alertId, userId });
      throw new Error("Alert not found");
    }

    const alert = await prisma.alert.update({
      where: { id: alertId },
      data: updateData,
    });

    logger.info("✅ Alert updated successfully", { alertId, userId });

    return alert;
  }

  static async deleteAlert(alertId: string, userId: string): Promise<void> {
    logger.info("🗑️ Deleting alert", { alertId, userId });

    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId,
      },
    });

    if (!alert) {
      logger.error("❌ Alert not found for deletion", { alertId, userId });
      throw new Error("Alert not found");
    }

    await prisma.alert.delete({
      where: { id: alertId },
    });

    logger.info("✅ Alert deleted successfully", { alertId, userId });
  }

  static async checkAndTriggerAlerts(
    cryptocurrencyId: string,
    currentPrice: number
  ): Promise<void> {
    try {
      logger.debug("🔍 Checking alerts for cryptocurrency", {
        cryptocurrencyId,
        currentPrice,
      });

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

      logger.debug("📋 Found alerts to check", {
        cryptocurrencyId,
        alertCount: alerts.length,
      });

      const triggeredAlerts = [];

      for (const alert of alerts) {
        const shouldTrigger = this.shouldTriggerAlert(alert, currentPrice);

        if (shouldTrigger) {
          triggeredAlerts.push(alert);
          logger.info("🚨 Alert should be triggered", {
            alertId: alert.id,
            userId: alert.userId,
            alertType: alert.alertType,
            targetPrice: alert.targetPrice,
            currentPrice,
          });
        }
      }

      if (triggeredAlerts.length > 0) {
        logger.info("🎯 Processing triggered alerts", {
          cryptocurrencyId,
          triggeredCount: triggeredAlerts.length,
        });
        await this.processTriggeredAlerts(triggeredAlerts, currentPrice);
      } else {
        logger.debug("✅ No alerts triggered", {
          cryptocurrencyId,
          currentPrice,
        });
      }
    } catch (error) {
      logger.error("❌ Error checking alerts", {
        cryptocurrencyId,
        currentPrice,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  private static shouldTriggerAlert(alert: any, currentPrice: number): boolean {
    const targetPrice = parseFloat(alert.targetPrice.toString());

    switch (alert.alertType) {
      case "ABOVE":
        return currentPrice >= targetPrice;
      case "BELOW":
        return currentPrice <= targetPrice;
      default:
        return false;
    }
  }

  private static async processTriggeredAlerts(
    alerts: any[],
    currentPrice: number
  ): Promise<void> {
    logger.info("🎯 Processing triggered alerts", {
      alertCount: alerts.length,
      currentPrice,
    });

    const triggerPromises = alerts.map(async (alert) => {
      try {
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            isTriggered: true,
            triggeredPrice: currentPrice,
            triggeredAt: new Date(),
          },
        });

        logger.info("✅ Alert updated with trigger information", {
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

        logger.info("📡 Event emitted for alert", {
          alertId: alert.id,
          userId: alert.userId,
        });
      } catch (error) {
        logger.error("❌ Failed to process triggered alert", {
          alertId: alert.id,
          userId: alert.userId,
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    });

    await Promise.all(triggerPromises);

    logger.info("✅ All triggered alerts processed", {
      alertCount: alerts.length,
    });
  }

  static async getUserTriggeredAlerts(
    userId: string
  ): Promise<AlertWithDetails[]> {
    logger.debug("📋 Getting user triggered alerts", { userId });

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
            updatedAt: true,
          },
        },
      },
      orderBy: { triggeredAt: "desc" },
    })) as AlertWithDetails[];

    logger.debug("✅ User triggered alerts retrieved", {
      userId,
      triggeredCount: alerts.length,
    });

    return alerts;
  }
}
