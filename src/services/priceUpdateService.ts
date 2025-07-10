import axios from "axios";
import { config } from "@/config/env";
import prisma from "@/config/database";
import { AlertService } from "@/services/alertService";
import { logger } from "@/services/loggerService";

export class PriceUpdateService {
  static async updateAllPrices(): Promise<void> {
    try {
      logger.info("🔄 Starting price update for all cryptocurrencies");

      const cryptocurrencies = await prisma.cryptocurrency.findMany();

      if (cryptocurrencies.length === 0) {
        logger.warn("⚠️  No cryptocurrencies found in database");
        return;
      }

      logger.info("📊 Found cryptocurrencies to update", {
        count: cryptocurrencies.length,
      });

      const coinIds = cryptocurrencies.map((crypto: any) => crypto.coinId);
      const prices = await this.fetchPricesFromCoinGecko(coinIds);

      let updatedCount = 0;
      let alertChecks = 0;

      for (const crypto of cryptocurrencies) {
        const price = prices[crypto.coinId]?.usd;
        if (price && price > 0) {
          await prisma.cryptocurrency.update({
            where: { id: crypto.id },
            data: {
              currentPrice: price,
              lastUpdated: new Date(),
            },
          });

          await AlertService.checkAndTriggerAlerts(crypto.id, price);

          updatedCount++;
          alertChecks++;
        }
      }

      logger.info("✅ Price update completed", {
        totalCryptocurrencies: cryptocurrencies.length,
        updatedCount,
        alertChecks,
        successRate: `${(
          (updatedCount / cryptocurrencies.length) *
          100
        ).toFixed(1)}%`,
      });
    } catch (error: any) {
      logger.error("❌ Error updating prices", {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  private static async fetchPricesFromCoinGecko(
    coinIds: string[]
  ): Promise<any> {
    try {
      logger.debug("🌐 Fetching prices from CoinGecko API", {
        coinCount: coinIds.length,
        endpoint: "simple/price",
      });

      const response = await axios.get(
        `${config.coinGeckoApiUrl}/simple/price`,
        {
          params: {
            ids: coinIds.join(","),
            vs_currencies: "usd",
          },
          timeout: 10000,
          headers: {
            "User-Agent": "CryptoPriceAlertService/1.0",
            Accept: "application/json",
          },
        }
      );

      logger.debug("✅ Successfully fetched prices from primary endpoint", {
        coinCount: coinIds.length,
        responseStatus: response.status,
      });

      return response.data;
    } catch (error: any) {
      logger.warn("⚠️  Primary API endpoint failed, trying fallback", {
        error: error.message,
        coinCount: coinIds.length,
      });

      // Try fallback endpoint
      try {
        const fallbackResponse = await axios.get(
          `${config.coinGeckoApiUrl}/coins/markets`,
          {
            params: {
              vs_currency: "usd",
              ids: coinIds.join(","),
              order: "market_cap_desc",
              per_page: 100,
              page: 1,
              sparkline: false,
            },
            timeout: 15000,
            headers: {
              "User-Agent": "CryptoPriceAlertService/1.0",
              Accept: "application/json",
            },
          }
        );

        const fallbackData: any = {};
        fallbackResponse.data.forEach((coin: any) => {
          fallbackData[coin.id] = { usd: coin.current_price };
        });

        logger.info("✅ Successfully fetched prices from fallback endpoint", {
          coinCount: coinIds.length,
          responseStatus: fallbackResponse.status,
        });

        return fallbackData;
      } catch (fallbackError: any) {
        logger.error("❌ Both API endpoints failed", {
          primaryError: error.message,
          fallbackError: fallbackError.message,
          coinCount: coinIds.length,
        });
        throw new Error(
          `Failed to fetch prices from CoinGecko API: ${error.message}`
        );
      }
    }
  }

  //  Update prices for specific cryptocurrencies
  static async updatePricesForCryptocurrencies(
    coinIds: string[]
  ): Promise<void> {
    try {
      logger.info("🔄 Updating prices for specific cryptocurrencies", {
        coinIds,
        count: coinIds.length,
      });

      const cryptocurrencies = await prisma.cryptocurrency.findMany({
        where: {
          coinId: { in: coinIds },
        },
      });

      if (cryptocurrencies.length === 0) {
        logger.warn("⚠️  No cryptocurrencies found for specified coin IDs", {
          coinIds,
        });
        return;
      }

      const prices = await this.fetchPricesFromCoinGecko(coinIds);
      let updatedCount = 0;

      for (const crypto of cryptocurrencies) {
        const price = prices[crypto.coinId]?.usd;
        if (price && price > 0) {
          await prisma.cryptocurrency.update({
            where: { id: crypto.id },
            data: {
              currentPrice: price,
              lastUpdated: new Date(),
            },
          });

          await AlertService.checkAndTriggerAlerts(crypto.id, price);
          updatedCount++;
        }
      }

      logger.info("✅ Specific cryptocurrency prices updated", {
        requestedCount: coinIds.length,
        foundCount: cryptocurrencies.length,
        updatedCount,
      });
    } catch (error) {
      logger.error("❌ Error updating specific cryptocurrency prices", {
        coinIds,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error("Failed to update cryptocurrency prices");
    }
  }

  static async getPriceUpdateStatus(): Promise<any> {
    logger.debug("📊 Getting price update status");

    const cryptocurrencies = await prisma.cryptocurrency.findMany({
      select: {
        id: true,
        name: true,
        symbol: true,
        currentPrice: true,
        lastUpdated: true,
      },
      orderBy: { lastUpdated: "desc" },
    });

    const status = {
      totalCryptocurrencies: cryptocurrencies.length,
      lastUpdated: cryptocurrencies[0]?.lastUpdated,
      cryptocurrencies,
    };

    logger.debug("✅ Price update status retrieved", {
      totalCryptocurrencies: status.totalCryptocurrencies,
      lastUpdated: status.lastUpdated,
    });

    return status;
  }

  // Fetch real-time prices directly from API
  static async getRealTimePrices(coinIds?: string[]): Promise<any> {
    try {
      logger.debug("🌐 Fetching real-time prices", {
        coinIds: coinIds || "all",
        count: coinIds?.length || "all",
      });

      if (!coinIds) {
        const cryptocurrencies = await prisma.cryptocurrency.findMany();
        coinIds = cryptocurrencies.map((crypto: any) => crypto.coinId);
      }

      if (coinIds.length === 0) {
        logger.warn("⚠️  No coin IDs provided for real-time price fetch");
        return {};
      }

      const prices = await this.fetchPricesFromCoinGecko(coinIds);

      logger.debug("✅ Real-time prices fetched successfully", {
        coinCount: coinIds.length,
        priceCount: Object.keys(prices).length,
      });

      return prices;
    } catch (error) {
      logger.error("❌ Error fetching real-time prices", {
        coinIds,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error("Failed to fetch real-time prices");
    }
  }

  static async updateAndGetRealTimePrices(): Promise<any> {
    try {
      logger.info("🔄 Updating and getting real-time prices");

      await this.updateAllPrices();

      const cryptocurrencies = await prisma.cryptocurrency.findMany({
        select: {
          id: true,
          coinId: true,
          symbol: true,
          name: true,
          currentPrice: true,
          lastUpdated: true,
        },
        orderBy: { lastUpdated: "desc" },
      });

      logger.info("✅ Real-time prices updated and retrieved", {
        count: cryptocurrencies.length,
      });

      return {
        totalCryptocurrencies: cryptocurrencies.length,
        lastUpdated: cryptocurrencies[0]?.lastUpdated,
        cryptocurrencies,
      };
    } catch (error) {
      logger.error("❌ Error updating and getting real-time prices", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error("Failed to update and get real-time prices");
    }
  }
}
