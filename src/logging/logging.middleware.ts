import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Log request
    this.loggingService.logRequest(req);

    // Add response listener to log after response is sent
    res.on('finish', () => {
      const responseTime = Date.now() - start;
      this.loggingService.logResponse(req, res, responseTime);
    });

    next();
  }
}
