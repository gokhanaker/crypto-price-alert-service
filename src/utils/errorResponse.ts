import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

export enum AuthErrorCodes {
  // Validation Errors (400)
  VALIDATION_ERROR = 'AUTH_VALIDATION_ERROR',
  INVALID_EMAIL = 'AUTH_INVALID_EMAIL',
  INVALID_PASSWORD = 'AUTH_INVALID_PASSWORD',
  WEAK_PASSWORD = 'AUTH_WEAK_PASSWORD',

  // Authentication Errors (401)
  UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  INVALID_TOKEN = 'AUTH_INVALID_TOKEN',

  // Authorization Errors (403)
  FORBIDDEN = 'AUTH_FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Not Found Errors (404)
  USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',

  // Conflict Errors (409)
  USER_ALREADY_EXISTS = 'AUTH_USER_ALREADY_EXISTS',
  EMAIL_ALREADY_REGISTERED = 'AUTH_EMAIL_ALREADY_REGISTERED',

  // Rate Limiting (429)
  TOO_MANY_LOGIN_ATTEMPTS = 'AUTH_TOO_MANY_LOGIN_ATTEMPTS',
  TOO_MANY_REGISTRATION_ATTEMPTS = 'AUTH_TOO_MANY_REGISTRATION_ATTEMPTS',
}

export enum AlertErrorCodes {
  // Validation Errors (400)
  VALIDATION_ERROR = 'ALERT_VALIDATION_ERROR',
  INVALID_ALERT_TYPE = 'ALERT_INVALID_TYPE',
  INVALID_TARGET_PRICE = 'ALERT_INVALID_PRICE',
  INVALID_CRYPTOCURRENCY_ID = 'ALERT_INVALID_CRYPTOCURRENCY_ID',

  // Not Found Errors (404)
  ALERT_NOT_FOUND = 'ALERT_NOT_FOUND',

  // Conflict Errors (409)
  ALERT_ALREADY_EXISTS = 'ALERT_ALREADY_EXISTS',
  DUPLICATE_ALERT = 'ALERT_DUPLICATE',

  // Business Logic Errors (422)
  INVALID_ALERT_CONDITION = 'ALERT_INVALID_CONDITION',
  ALERT_LIMIT_EXCEEDED = 'ALERT_LIMIT_EXCEEDED',
}

export enum CryptocurrencyErrorCodes {
  // Validation Errors (400)
  VALIDATION_ERROR = 'CRYPTO_VALIDATION_ERROR',
  INVALID_SYMBOL = 'CRYPTO_INVALID_SYMBOL',
  INVALID_PRICE = 'CRYPTO_INVALID_PRICE',

  // Not Found Errors (404)
  CRYPTOCURRENCY_NOT_FOUND = 'CRYPTO_NOT_FOUND',
  PRICE_DATA_NOT_FOUND = 'CRYPTO_PRICE_DATA_NOT_FOUND',

  // External Service Errors (502)
  EXTERNAL_API_ERROR = 'CRYPTO_EXTERNAL_API_ERROR',
  PRICE_FETCH_FAILED = 'CRYPTO_PRICE_FETCH_FAILED',
}

export enum CommonErrorCodes {
  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'COMMON_INTERNAL_ERROR',
  DATABASE_ERROR = 'COMMON_DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'COMMON_EXTERNAL_SERVICE_ERROR',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'COMMON_RATE_LIMIT_EXCEEDED',

  // Bad Gateway (502)
  SERVICE_UNAVAILABLE = 'COMMON_SERVICE_UNAVAILABLE',

  // Validation Errors (400)
  VALIDATION_ERROR = 'COMMON_VALIDATION_ERROR',
  INVALID_REQUEST = 'COMMON_INVALID_REQUEST',
}

// Union type for all error codes
export type AppErrorCodes =
  | AuthErrorCodes
  | AlertErrorCodes
  | CryptocurrencyErrorCodes
  | CommonErrorCodes;

// HTTP status code mapping
export const HTTP_STATUS_MAPPING: Record<AppErrorCodes, number> = {
  // Auth Error Codes
  [AuthErrorCodes.VALIDATION_ERROR]: 400,
  [AuthErrorCodes.INVALID_EMAIL]: 400,
  [AuthErrorCodes.INVALID_PASSWORD]: 400,
  [AuthErrorCodes.WEAK_PASSWORD]: 400,
  [AuthErrorCodes.UNAUTHORIZED]: 401,
  [AuthErrorCodes.INVALID_CREDENTIALS]: 401,
  [AuthErrorCodes.TOKEN_EXPIRED]: 401,
  [AuthErrorCodes.INVALID_TOKEN]: 401,
  [AuthErrorCodes.FORBIDDEN]: 403,
  [AuthErrorCodes.INSUFFICIENT_PERMISSIONS]: 403,
  [AuthErrorCodes.USER_NOT_FOUND]: 404,
  [AuthErrorCodes.USER_ALREADY_EXISTS]: 409,
  [AuthErrorCodes.EMAIL_ALREADY_REGISTERED]: 409,
  [AuthErrorCodes.TOO_MANY_LOGIN_ATTEMPTS]: 429,
  [AuthErrorCodes.TOO_MANY_REGISTRATION_ATTEMPTS]: 429,

  // Alert Error Codes
  [AlertErrorCodes.VALIDATION_ERROR]: 400,
  [AlertErrorCodes.INVALID_ALERT_TYPE]: 400,
  [AlertErrorCodes.INVALID_TARGET_PRICE]: 400,
  [AlertErrorCodes.INVALID_CRYPTOCURRENCY_ID]: 400,
  [AlertErrorCodes.ALERT_NOT_FOUND]: 404,
  [AlertErrorCodes.ALERT_ALREADY_EXISTS]: 409,
  [AlertErrorCodes.DUPLICATE_ALERT]: 409,
  [AlertErrorCodes.INVALID_ALERT_CONDITION]: 422,
  [AlertErrorCodes.ALERT_LIMIT_EXCEEDED]: 422,

  // Cryptocurrency Error Codes
  [CryptocurrencyErrorCodes.VALIDATION_ERROR]: 400,
  [CryptocurrencyErrorCodes.INVALID_SYMBOL]: 400,
  [CryptocurrencyErrorCodes.INVALID_PRICE]: 400,
  [CryptocurrencyErrorCodes.CRYPTOCURRENCY_NOT_FOUND]: 404,
  [CryptocurrencyErrorCodes.PRICE_DATA_NOT_FOUND]: 404,
  [CryptocurrencyErrorCodes.EXTERNAL_API_ERROR]: 502,
  [CryptocurrencyErrorCodes.PRICE_FETCH_FAILED]: 502,

  // Common Error Codes
  [CommonErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [CommonErrorCodes.DATABASE_ERROR]: 500,
  [CommonErrorCodes.EXTERNAL_SERVICE_ERROR]: 500,
  [CommonErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [CommonErrorCodes.SERVICE_UNAVAILABLE]: 502,
  [CommonErrorCodes.VALIDATION_ERROR]: 400,
  [CommonErrorCodes.INVALID_REQUEST]: 400,
};

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
    requestId: string;
    path: string;
  };
  data: null;
}

// Success response interface
export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
  requestId: string;
}

// Error response helper
export const createErrorResponse = (
  req: Request,
  code: AppErrorCodes,
  message: string,
  details?: string
): ErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
    requestId: uuidv4(),
    path: req.path,
  },
  data: null,
});

// Success response helper
export const createSuccessResponse = <T>(
  req: Request,
  data: T,
  message?: string
): SuccessResponse<T> => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString(),
  requestId: uuidv4(),
});

// Generate request ID
export const generateRequestId = (): string => uuidv4();

// Legacy export for backward compatibility (deprecated)
export { AlertErrorCodes as LegacyAlertErrorCodes };
