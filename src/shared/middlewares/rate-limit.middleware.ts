import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';

const rateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60,
  blockDuration: 300,
});

interface AuthenticatedRequest extends Request {
  user?: { id: string };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const key = req.user?.id || req.ip;
      this.logger.debug(`Rate limiting key: ${key}`); // Log the key being used

      if (!key) {
        const errorMessage = 'Invalid request: Missing authentication or IP.';
        this.logger.error(`Rate limiting failed: ${errorMessage}`);
        throw new AppError(ErrorCode['0006'], errorMessage);
      }

      const rateLimiterRes = await rateLimiter.get(key);
      this.logger.debug(
        `Rate limiter response: ${JSON.stringify(rateLimiterRes)}`,
      );

      if (rateLimiterRes && rateLimiterRes.consumedPoints >= 3) {
        const remainingTime = Math.ceil(rateLimiterRes.msBeforeNext / 1000); // Time in seconds
        const remainingRequests = rateLimiterRes.remainingPoints;

        const errorMessage =
          remainingRequests > 0
            ? `Too many requests, try again in 5 mins. You have ${remainingRequests} requests left before the limit resets.`
            : `Too many requests, try again in ${remainingTime} seconds.`;

        this.logger.warn(`Rate limiting error: ${errorMessage}`);
        throw new AppError(ErrorCode['0010'], errorMessage);
      }

      const remainingPoints = rateLimiterRes
        ? 3 - rateLimiterRes.consumedPoints
        : 3;

      this.logger.log(
        `Rate limiting: ${remainingPoints} requests remaining before limit.`,
      );

      await rateLimiter.consume(key);
      this.logger.debug(`Rate limiter consumed for key: ${key}`);
      next();
    } catch (err) {
      if (err instanceof AppError) {
        this.logger.warn(`Rate limiting error: ${err.message}`);
        throw err;
      }

      const errorMessage = 'Too many requests. Try again after 5 minutes.';
      this.logger.error(`Rate limiting exceeded: ${errorMessage}`, err.stack);
      this.logger.debug(`Error details: ${JSON.stringify(err)}`);
      throw new AppError(ErrorCode['0010'], errorMessage);
    }
  }
}
