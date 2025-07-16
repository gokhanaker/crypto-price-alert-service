import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Error codes enum
export enum AlertErrorCodes {
  // Validation Errors (400)
  VALIDATION_ERROR = 'ALERT_VALIDATION_ERROR',
  INVALID_CRYPTOCURRENCY = 'ALERT_INVALID_CRYPTOCURRENCY',
  INVALID_ALERT_TYPE = 'ALERT_INVALID_TYPE',
  INVALID_TARGET_PRICE = 'ALERT_INVALID_PRICE',

  // Authentication/Authorization Errors (401/403)
  UNAUTHORIZED = 'ALERT_UNAUTHORIZED',
  FORBIDDEN = 'ALERT_FORBIDDEN',

  // Not Found Errors (404)
  ALERT_NOT_FOUND = 'ALERT_NOT_FOUND',
  CRYPTOCURRENCY_NOT_FOUND = 'ALERT_CRYPTOCURRENCY_NOT_FOUND',

  // Conflict Errors (409)
  ALERT_ALREADY_EXISTS = 'ALERT_ALREADY_EXISTS',

  // Server Errors (500)
  INTERNAL_SERVER_ERROR = 'ALERT_INTERNAL_ERROR',
  DATABASE_ERROR = 'ALERT_DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'ALERT_EXTERNAL_SERVICE_ERROR',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'ALERT_RATE_LIMIT_EXCEEDED',
}

// HTTP status code mapping
export const HTTP_STATUS_MAPPING: Record<AlertErrorCodes, number> = {
  [AlertErrorCodes.VALIDATION_ERROR]: 400,
  [AlertErrorCodes.INVALID_CRYPTOCURRENCY]: 400,
  [AlertErrorCodes.INVALID_ALERT_TYPE]: 400,
  [AlertErrorCodes.INVALID_TARGET_PRICE]: 400,
  [AlertErrorCodes.UNAUTHORIZED]: 401,
  [AlertErrorCodes.FORBIDDEN]: 403,
  [AlertErrorCodes.ALERT_NOT_FOUND]: 404,
  [AlertErrorCodes.CRYPTOCURRENCY_NOT_FOUND]: 404,
  [AlertErrorCodes.ALERT_ALREADY_EXISTS]: 409,
  [AlertErrorCodes.RATE_LIMIT_EXCEEDED]: 429,
  [AlertErrorCodes.INTERNAL_SERVER_ERROR]: 500,
  [AlertErrorCodes.DATABASE_ERROR]: 500,
  [AlertErrorCodes.EXTERNAL_SERVICE_ERROR]: 500,
};

// Error response interface
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
    timestamp: string;
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
}

// Error response helper
export const createErrorResponse = (
  req: Request,
  code: AlertErrorCodes,
  message: string,
  details?: string,
  requestId?: string
): ErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
    timestamp: new Date().toISOString(),
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
});

// Generate request ID
export const generateRequestId = (): string => uuidv4();
