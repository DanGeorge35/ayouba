import { Request, Response, NextFunction } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import configuration from 'src/libs/configuration';
import { HmacHelper } from 'src/modules/common-module/services/hmac-helper.service';

const config = configuration();

function getSetKeys(service: string): { hmac: string; salt: string } {
  switch (service) {
    case 'user':
      return {
        hmac: config.hmac.user_hmacKey as string,
        salt: config.hmac.user_hmacSalt as string,
      };
    case 'airtime':
      return {
        hmac: config.hmac.airtime_hmacKey as string,
        salt: config.hmac.airtime_hmacSalt as string,
      };
    case 'power':
      return {
        hmac: config.hmac.power_hmac_key as string,
        salt: config.hmac.power_hmac_salt as string,
      };
    case 'lambda':
      return {
        hmac: config.hmac.lambda_hmacKey as string,
        salt: config.hmac.lambda_hmacSalt as string,
      };
    case 'wallet':
      return {
        hmac: config.hmac.wallet_hmacKey as string,
        salt: config.hmac.wallet_hmacSalt as string,
      };
    default:
      throw new AppError(ErrorCode['0006'], 'Invalid service type');
  }
}

@Injectable()
export class HmacMiddleware2 implements NestMiddleware {
  private readonly logger = new Logger(HmacMiddleware2.name);

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const receivedHmac = req.headers['x-hmac-signature'] as string;
      const timestamp = req.headers['x-hmac-timestamp'] as string;

      if (!receivedHmac || !timestamp) {
        throw new AppError(ErrorCode['0004'], 'Missing HMAC headers');
      }

      // Validate timestamp (5-minute window)
      const now = Math.floor(Date.now() / 1000);
      const reqTime = parseInt(timestamp, 10);

      if (isNaN(reqTime) || Math.abs(now - reqTime) > 300) {
        throw new AppError(ErrorCode['0005'], 'Stale or invalid timestamp');
      }

      const method = req.method;
      const path = req.originalUrl.split('?')[0];
      const payload = method === 'GET' ? '' : req.body;

      let service: string;
      if (path.includes('pins')) {
        service = 'user';
      } else if (path.includes('airtime')) {
        service = 'airtime';
      } else if (path.includes('power')) {
        service = 'power';
      } else if (path.includes('wallet')) {
        service = 'wallet';
      } else {
        service = 'lambda';
      }

      const { hmac, salt } = getSetKeys(service);
      const hmacHelper = new HmacHelper(hmac, salt);

      const isValidHmac = hmacHelper.verifyHmac2(
        method,
        path,
        payload,
        timestamp,
        receivedHmac,
      );

      if (!isValidHmac) {
        throw new AppError(ErrorCode['0005'], 'Invalid signature');
      }

      next();
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
