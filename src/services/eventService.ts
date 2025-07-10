import { EventEmitter } from 'events';
import { logger } from '@/services/loggerService';

export interface AlertTriggeredEvent {
  alertId: string;
  userId: string;
  cryptocurrencyId: string;
  cryptocurrencySymbol: string;
  cryptocurrencyName: string;
  alertType: 'ABOVE' | 'BELOW';
  targetPrice: number;
  triggeredPrice: number;
  triggeredAt: Date;
  userEmail: string;
  userName: string;
}

export interface EventListener {
  onAlertTriggered(event: AlertTriggeredEvent): Promise<void>;
}

export class EventService extends EventEmitter {
  private static instance: EventService;

  private constructor() {
    super();
    this.setMaxListeners(20); // Allow multiple listeners
    logger.info('📡 EventService initialized');
  }

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  static emitAlertTriggered(event: AlertTriggeredEvent): void {
    const eventService = EventService.getInstance();

    logger.info('📡 Emitting alert triggered event', {
      alertId: event.alertId,
      userId: event.userId,
      cryptocurrency: event.cryptocurrencySymbol,
      alertType: event.alertType,
      targetPrice: event.targetPrice,
      triggeredPrice: event.triggeredPrice,
    });

    eventService.emit('alertTriggered', event);

    logger.info('📡 Event emitted successfully', {
      alertId: event.alertId,
      listenerCount: eventService.listenerCount('alertTriggered'),
    });
  }

  static onAlertTriggered(listener: EventListener): void {
    const eventService = EventService.getInstance();

    logger.info('🎧 Registering event listener', {
      listenerName: listener.constructor.name,
      currentListeners: eventService.listenerCount('alertTriggered'),
    });

    eventService.on('alertTriggered', async (event: AlertTriggeredEvent) => {
      try {
        logger.debug('🎧 Event listener processing event', {
          alertId: event.alertId,
          listenerName: listener.constructor.name,
        });

        await listener.onAlertTriggered(event);

        logger.debug('✅ Event listener processed successfully', {
          alertId: event.alertId,
          listenerName: listener.constructor.name,
        });
      } catch (error) {
        logger.error('❌ Error in event listener', {
          alertId: event.alertId,
          listenerName: listener.constructor.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    });

    logger.info('✅ Event listener registered successfully', {
      listenerName: listener.constructor.name,
      totalListeners: eventService.listenerCount('alertTriggered'),
    });
  }
}
