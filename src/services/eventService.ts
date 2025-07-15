import { EventEmitter } from 'events';
import { logger } from '@/services/loggerService';
import { AlertTriggeredEvent } from '@/types';

export interface EventListener {
  onAlertTriggered(event: AlertTriggeredEvent): Promise<void>;
}

export class EventService extends EventEmitter {
  private static instance: EventService;

  private constructor() {
    super();
    this.setMaxListeners(20);
  }

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  static emitAlertTriggered(event: AlertTriggeredEvent): void {
    const eventService = EventService.getInstance();

    eventService.emit('alertTriggered', event);

    logger.info('📡 Event emitted successfully', {
      alertId: event.alertId,
      listenerCount: eventService.listenerCount('alertTriggered'),
    });
  }

  static onAlertTriggered(listener: EventListener): void {
    const eventService = EventService.getInstance();

    eventService.on('alertTriggered', async (event: AlertTriggeredEvent) => {
      try {
        await listener.onAlertTriggered(event);
      } catch (error) {
        logger.error('❌ Error in event listener', {
          alertId: event.alertId,
          listenerName: listener.constructor.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
      }
    });
  }
}
