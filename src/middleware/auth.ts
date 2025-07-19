import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/authService';
import { AuthErrorCodes, createErrorResponse } from '@/utils/errorResponse';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res
        .status(401)
        .json(createErrorResponse(req, AuthErrorCodes.UNAUTHORIZED, 'Access token required'));
    }

    const user = await AuthService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(403)
      .json(createErrorResponse(req, AuthErrorCodes.FORBIDDEN, 'Invalid or expired token'));
  }
};
