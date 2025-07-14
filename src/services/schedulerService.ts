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

    return status;
  }

  static initializeScheduler(): void {
    if (this.isRunning) {
      logger.warn('⚠️  Price update scheduler is already running');
      return;
    }

    const interval = parseInt(config.priceUpdateInterval) || 1;

    cron.schedule(
      `*/${interval} * * * *`,
      async () => {
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
  }
}
