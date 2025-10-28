/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHmac } from 'crypto';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import configuration from 'src/libs/configuration';

const config = configuration();

function getSetKeys(service: string): { hmac: string; salt: string } {
  switch (service) {
    case 'user':
      return {
        hmac: config.hmac.user_hmacKey as string,
        salt: config.hmac.user_hmacSalt as string,
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
export class HmacMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HmacMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const receivedHmac = req.headers['x-hmac-signature'] as string;
    const serviceName = req.headers['x-service-name'] as string;
    const message = req.method === 'GET' ? '' : req.body;

    const path = serviceName ?? req.originalUrl.split('?')[0];

    let service: string;

    if (path.includes('pins')) {
      service = 'user';
    } else if (path.includes('requery') || path.includes('cashier')) {
      service = 'lambda';
    } else if (path.includes('wallet')) {
      service = 'wallet';
    } else if (path.includes('power')) {
      service = 'power';
    } else {
      service = 'lambda';
    }

    this.logger.log('SERVICE: ', service);

    const { hmac, salt } = getSetKeys(service);

    if (!receivedHmac || !verifyHmac(message, receivedHmac, hmac, salt)) {
      throw new AppError(ErrorCode['0005'], 'Invalid HMAC signature');
    }

    next();
  }
}

export function createHmacHash(
  message: any,
  hmacKey: string,
  salt: string,
): string {
  const hmac = createHmac('sha256', hmacKey);
  hmac.update(JSON.stringify(message) + salt, 'utf8');
  return hmac.digest('hex');
}

export function verifyHmac(
  message: any,
  receivedHmac: string,
  hmacKey: string,
  salt: string,
): boolean {
  const calculatedHmac = createHmacHash(message, hmacKey, salt);
  return calculatedHmac === receivedHmac;
}
