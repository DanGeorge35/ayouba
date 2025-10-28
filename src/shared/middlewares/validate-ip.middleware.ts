import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import configuration from 'src/libs/configuration';
import { WhitelistService } from 'src/modules/cms-admin-module/whitelist';
import * as requestIp from 'request-ip';

const config = configuration();

@Injectable()
export class ValidateIpMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateIpMiddleware.name);

  constructor(private readonly ipService: WhitelistService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const merchantId = req['user']['merchant_id'];
    const incomingIp = requestIp.getClientIp(req);
    if (config.app.debug == 'false') {
      try {
        this.logger.log(`Incoming IP: ${incomingIp}`);
        this.logger.log(`merchant_id: ${merchantId}`);

        const ipExists = await this.ipService.isIpAllowed(
          incomingIp,
          merchantId,
        );

        if (!ipExists) {
          throw new AppError(
            ErrorCode['0005'],
            'Access denied: IP not allowed',
          );
        }
      } catch (error) {
        this.logger.error(error);
        throw error;
      }
    }

    next();
  }
}
