import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AlertErrorCodes, createErrorResponse } from '@/utils/errorResponse';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res
        .status(400)
        .json(
          createErrorResponse(
            req,
            AlertErrorCodes.VALIDATION_ERROR,
            'Validation error',
            error.details.map(detail => detail.message).join(', ')
          )
        );
    }

    next();
  };
};

export const userRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().optional().required(),
  lastName: Joi.string().optional().required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createAlertSchema = Joi.object({
  cryptocurrencyId: Joi.string().uuid().required(),
  alertType: Joi.string().valid('ABOVE', 'BELOW').required(),
  targetPrice: Joi.number().positive().required(),
});

export const updateAlertSchema = Joi.object({
  alertType: Joi.string().valid('ABOVE', 'BELOW').required(),
  targetPrice: Joi.number().positive().required(),
});
