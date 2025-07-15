import { EventService, EventListener } from '@/services/eventService';
import { AlertTriggeredEvent } from '@/types';
import { logger } from '@/services/loggerService';

// THIS IS A MOCK EVENT CONTROLLER FOR DEVELOPMENT PURPOSE ONLY
// IT SHOULD BE REPLACED WITH A REAL EVENT CONSUMER SERVICE IN PRODUCTION
export class EventController implements EventListener {
  private static instance: EventController;

  private constructor() {
    // Register this controller as an event listener
    EventService.onAlertTriggered(this);
  }

  static getInstance(): EventController {
    if (!EventController.instance) {
      EventController.instance = new EventController();
    }
    return EventController.instance;
  }

  async onAlertTriggered(event: AlertTriggeredEvent): Promise<void> {
    logger.info('🎯 Event Controller received alert triggered event', {
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

      logger.info('✅ All notification types processed successfully for alert', {
        alertId: event.alertId,
        userId: event.userId,
      });
    } catch (error) {
      logger.error('❌ Error processing alert triggered event', {
        alertId: event.alertId,
        userId: event.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  }

  // Simulate email notification to user
  private async handleEmailNotification(event: AlertTriggeredEvent): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      logger.info('📧 Email notification sent successfully', {
        alertId: event.alertId,
        userEmail: event.userEmail,
        subject: `Crypto Alert - ${event.cryptocurrencySymbol} ${event.alertType} ${event.targetPrice}`,
        currentPrice: event.triggeredPrice,
        targetPrice: event.targetPrice,
      });
    } catch (error) {
      logger.error('❌ Email notification failed', {
        alertId: event.alertId,
        userEmail: event.userEmail,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  // Simulate push notification to user
  private async handlePushNotification(event: AlertTriggeredEvent): Promise<void> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      logger.info('📱 Push notification sent successfully', {
        alertId: event.alertId,
        userId: event.userId,
        title: `${event.cryptocurrencySymbol} Alert Triggered!`,
        message: `${event.cryptocurrencyName} is now $${event.triggeredPrice.toLocaleString()}`,
      });
    } catch (error) {
      logger.error('❌ Push notification failed', {
        alertId: event.alertId,
        userId: event.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
