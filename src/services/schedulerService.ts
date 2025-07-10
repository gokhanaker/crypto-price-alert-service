import cron from 'node-cron';
import { PriceUpdateService } from '@/services/priceUpdateService';
import { config } from '@/config/env';
import { logger } from '@/services/loggerService';

export class SchedulerService {
  private static isRunning = false;

  static getSchedulerStatus(): { isRunning: boolean; nextUpdate?: Date } {
    const tasks = cron.getTasks();
    const priceUpdateTask = tasks.get('price-update');

    const status = {
      isRunning: this.isRunning,
      nextUpdate: priceUpdateTask ? new Date(Date.now() + 2 * 60 * 1000) : undefined,
    };

    logger.debug('📊 Scheduler status retrieved', status);
    return status;
  }

  static initializeScheduler(): void {
    logger.info('🚀 Initializing price update scheduler...');

    if (this.isRunning) {
      logger.warn('⚠️  Price update scheduler is already running');
      return;
    }

    const interval = parseInt(config.priceUpdateInterval) || 1;

    logger.info('⏰ Starting price update scheduler', {
      interval,
      timezone: 'UTC',
    });

    cron.schedule(
      `*/${interval} * * * *`,
      async () => {
        logger.info('🕐 Scheduled price update starting...');
        try {
          await PriceUpdateService.updateAllPrices();
          logger.info('✅ Scheduled price update completed successfully');
        } catch (error) {
          logger.error('❌ Scheduled price update failed', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      },
      {
        scheduled: true,
        timezone: 'UTC',
      }
    );

    this.isRunning = true;
    logger.info('⏰ Price update scheduler started', {
      interval,
      nextUpdate: new Date(Date.now() + interval * 60 * 1000).toISOString(),
    });
  }
}
