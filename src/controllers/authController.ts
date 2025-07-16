import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { logger } from '@/services/loggerService';
import { AlertErrorCodes, createErrorResponse, createSuccessResponse } from '@/utils/errorResponse';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);

      res.status(201).json(createSuccessResponse(req, result, 'User registered successfully'));
    } catch (error: any) {
      logger.error('User registration failed', {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
      });

      let statusCode = 500;
      let errorCode = AlertErrorCodes.INTERNAL_SERVER_ERROR;
      let message = 'Failed to register user';

      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        statusCode = 409;
        errorCode = AlertErrorCodes.USER_ALREADY_EXISTS;
        message = 'User with this email already exists';
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        statusCode = 400;
        errorCode = AlertErrorCodes.VALIDATION_ERROR;
        message = 'Invalid registration data provided';
      } else if (error.message.includes('password')) {
        statusCode = 400;
        errorCode = AlertErrorCodes.VALIDATION_ERROR;
        message = 'Password requirements not met';
      }

      res.status(statusCode).json(createErrorResponse(req, errorCode, message, error.message));
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const result = await AuthService.login(req.body);

      res.status(200).json(createSuccessResponse(req, result, 'Login successful'));
    } catch (error: any) {
      logger.error('User login failed', {
        email: req.body.email,
        error: error.message,
        stack: error.stack,
      });

      let statusCode = 500;
      let errorCode = AlertErrorCodes.INTERNAL_SERVER_ERROR;
      let message = 'Failed to authenticate user';

      if (error.message.includes('invalid credentials') || error.message.includes('password')) {
        statusCode = 401;
        errorCode = AlertErrorCodes.INVALID_CREDENTIALS;
        message = 'Invalid email or password';
      } else if (error.message.includes('user not found')) {
        statusCode = 404;
        errorCode = AlertErrorCodes.USER_NOT_FOUND;
        message = 'User not found';
      } else if (error.message.includes('validation')) {
        statusCode = 400;
        errorCode = AlertErrorCodes.VALIDATION_ERROR;
        message = 'Invalid login data provided';
      }

      res.status(statusCode).json(createErrorResponse(req, errorCode, message, error.message));
    }
  }
}
