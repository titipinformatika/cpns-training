import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';
import { errorResponse } from '../utils/response.js';

/** Validasi req.body */
export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json(errorResponse('Validasi gagal', errors));
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Validasi req.query */
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json(errorResponse('Parameter query tidak valid', errors));
      return;
    }
    req.query = result.data as any;
    next();
  };
}

/** Validasi req.params */
export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json(errorResponse('Parameter URL tidak valid', errors));
      return;
    }
    req.params = result.data as any;
    next();
  };
}
