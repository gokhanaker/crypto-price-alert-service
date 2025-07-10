import {
  EventService,
  AlertTriggeredEvent,
  EventListener,
} from "../services/eventService";
import { logger } from "../services/loggerService";

export class EventController implements EventListener {
  private static instance: EventController;

  private constructor() {
    // Register this controller as an event listener
    EventService.onAlertTriggered(this);
    logger.info(
      "🎯 EventController initialized and registered as event listener"
    );
  }

  // Get singleton instance
  static getInstance(): EventController {
    if (!EventController.instance) {
      EventController.instance = new EventController();
    }
    return EventController.instance;
  }

  // Handle alert triggered event
  async onAlertTriggered(event: AlertTriggeredEvent): Promise<void> {
    logger.info("🎯 Event Controller received alert triggered event", {
      alertId: event.alertId,
      cryptocurrency: event.cryptocurrencySymbol,
      user: event.userEmail,
      targetPrice: event.targetPrice,
      triggeredPrice: event.triggeredPrice,
      alertType: event.alertType,
      triggeredAt: event.triggeredAt,
    });

    try {
      // Simulate different notification types
      await this.handleEmailNotification(event);
      await this.handlePushNotification(event);

      logger.info(
        "✅ All notification types processed successfully for alert",
        {
          alertId: event.alertId,
          userId: event.userId,
        }
      );
    } catch (error) {
      logger.error("❌ Error processing alert triggered event", {
        alertId: event.alertId,
        userId: event.userId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  // Simulate email notification to user
  private async handleEmailNotification(
    event: AlertTriggeredEvent
  ): Promise<void> {
    try {
      logger.info("📧 Starting email notification process", {
        alertId: event.alertId,
        userEmail: event.userEmail,
        cryptocurrency: event.cryptocurrencySymbol,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      logger.info("📧 Email notification sent successfully", {
        alertId: event.alertId,
        userEmail: event.userEmail,
        subject: `Crypto Alert - ${event.cryptocurrencySymbol} ${event.alertType} ${event.targetPrice}`,
        currentPrice: event.triggeredPrice,
        targetPrice: event.targetPrice,
      });
    } catch (error) {
      logger.error("❌ Email notification failed", {
        alertId: event.alertId,
        userEmail: event.userEmail,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  // Simulate push notification to user
  private async handlePushNotification(
    event: AlertTriggeredEvent
  ): Promise<void> {
    try {
      logger.info("📱 Starting push notification process", {
        alertId: event.alertId,
        userId: event.userId,
        cryptocurrency: event.cryptocurrencySymbol,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      logger.info("📱 Push notification sent successfully", {
        alertId: event.alertId,
        userId: event.userId,
        title: `${event.cryptocurrencySymbol} Alert Triggered!`,
        message: `${
          event.cryptocurrencyName
        } is now $${event.triggeredPrice.toLocaleString()}`,
      });
    } catch (error) {
      logger.error("❌ Push notification failed", {
        alertId: event.alertId,
        userId: event.userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }
}
