import { Request, Response, NextFunction } from 'express';

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: Object.values(error.errors).map((err: any) => err.message)
    });
  }

  if (error.code === '23505') { // PostgreSQL unique violation
    return res.status(409).json({
      message: 'Resource already exists'
    });
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    return res.status(400).json({
      message: 'Referenced resource does not exist'
    });
  }

  res.status(error.status || 500).json({
    message: error.message || 'Internal Server Error'
  });
};