// Database Model Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string | null;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cryptocurrency {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  currentPrice: any | null; // Using 'any' to handle Prisma's Decimal type, can be null until scheduler updates with real market price
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type AlertType = "ABOVE" | "BELOW";

export interface Alert {
  id: string;
  userId: string;
  cryptocurrencyId: string;
  alertType: AlertType;
  targetPrice: any; // Using 'any' to handle Prisma's Decimal type
  isTriggered: boolean;
  triggeredPrice: any | null; // Using 'any' to handle Prisma's Decimal type
  triggeredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateAlertRequest {
  cryptocurrencyId: string;
  alertType: AlertType;
  targetPrice: number;
}

export interface UpdateAlertRequest {
  alertType?: AlertType;
  targetPrice?: number;
}

// API Response Types
export interface AuthResponse {
  token: string;
  user: Omit<User, "passwordHash">;
}

export interface AlertWithDetails extends Alert {
  cryptocurrency: Cryptocurrency;
  user: Omit<User, "passwordHash">;
}

// External API Types (CoinGecko)
export interface CoinGeckoPrice {
  [coinId: string]: {
    usd: number;
  };
}

export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  last_updated: string;
}
