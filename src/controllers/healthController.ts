import { Request, Response } from "express";
import { config } from "../config/env";
import prisma from "../config/database";
import { SchedulerService } from "../services/schedulerService";
import { PriceUpdateService } from "../services/priceUpdateService";
import { logger } from "../services/loggerService";

export class HealthController {
  // Get health status of the app
  static async getHealthStatus(req: Request, res: Response): Promise<void> {
    try {
      logger.debug("🏥 Health check requested");

      // Test database connection
      await prisma.$queryRaw`SELECT 1`;

      // Get system info
      const systemInfo = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      };

      const schedulerStatus = SchedulerService.getSchedulerStatus();
      const priceStatus = await PriceUpdateService.getPriceUpdateStatus();

      const healthStatus = {
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        database: "connected",
        system: systemInfo,
        scheduler: schedulerStatus,
        prices: priceStatus,
      };

      logger.debug("✅ Health check passed", {
        environment: config.nodeEnv,
        uptime: systemInfo.uptime,
        schedulerActive: schedulerStatus.isRunning,
        totalCryptocurrencies: priceStatus.totalCryptocurrencies,
      });

      res.json(healthStatus);
    } catch (error) {
      logger.error("❌ Health check failed", {
        error:
          error instanceof Error ? error.message : "Database connection failed",
        stack: error instanceof Error ? error.stack : undefined,
      });

      res.status(503).json({
        status: "ERROR",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        database: "disconnected",
        error:
          error instanceof Error ? error.message : "Database connection failed",
      });
    }
  }

  // Get health status of scheduler
  static async getSchedulerHealth(req: Request, res: Response): Promise<void> {
    try {
      logger.info("📊 Getting scheduler health status");

      const schedulerStatus = SchedulerService.getSchedulerStatus();
      const priceStatus = await PriceUpdateService.getPriceUpdateStatus();

      logger.debug("✅ Scheduler health retrieved", {
        schedulerStatus,
        priceStatus: {
          totalCryptocurrencies: priceStatus.totalCryptocurrencies,
          lastUpdated: priceStatus.lastUpdated,
        },
      });

      res.json({
        success: true,
        scheduler: schedulerStatus,
        prices: priceStatus,
      });
    } catch (error: any) {
      logger.error("❌ Error getting scheduler health", {
        error: error.message,
        stack: error.stack,
      });
      res.status(500).json({
        success: false,
        message: "Failed to get scheduler health",
        error: error.message,
      });
    }
  }
}
