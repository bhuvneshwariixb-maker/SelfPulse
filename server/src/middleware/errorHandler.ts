import { Request, Response, NextFunction } from 'express'
import { logger } from '../services/logger.js'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error(err, 'Unhandled error')

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    })
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      statusCode: 400,
    })
  }

  res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  })
}
