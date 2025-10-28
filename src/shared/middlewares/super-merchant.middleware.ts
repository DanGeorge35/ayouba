import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import { IJwtDecodedToken } from '../interfaces';
import configuration from 'src/libs/configuration';
import {
  AwsCognitoService,
  ICognitoConfigurePayload,
} from 'src/modules/aws-module';

const config = configuration();

//  const whitelist = ['127.0.0.1', '192.168.1.100']; // Add your allowed IP addresses here
const whitelist = ['142.4.16.174', '100.27.180.177'];

@Injectable()
export class SuperMerchantIpMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SuperMerchantIpMiddleware.name);

  constructor(private readonly cognitoService: AwsCognitoService) {
    const payload: ICognitoConfigurePayload = {
      user_pool_id: config.aws.cognito.apiUserUserPoolId,
      client_id: config.aws.cognito.apiUserClientId,
      region: config.aws.cognito.apiUserRegion,
      client_secret: config.aws.cognito.apiUserClientSecret,
    };

    this.cognitoService = new AwsCognitoService(payload);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const isDev = config.app.env.toLowerCase() === 'dev';

    if (isDev) {
      this.logger.warn(
        'Development environment detected. Skipping IP whitelist check.',
      );
    } else {
      const rawIp =
        req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
      const clientIp = Array.isArray(rawIp) ? rawIp[0] : rawIp.split(':').pop();

      if (!whitelist.includes(clientIp)) {
        Logger.warn(clientIp + ' Not white-listed');
        throw new AppError(
          ErrorCode['0009'],
          'You are not permitted to carry out this operation',
        );
      }
    }

    try {
      const { authorization: tokenHeader } = req.headers;

      if (!tokenHeader) {
        throw new AppError(
          ErrorCode['0005'],
          'Access denied. User authentication required.',
        );
      }

      const token = req.headers.authorization?.split(' ')[1];
      const jwtPayload = await this.cognitoService.verifyToken(token);

      const userDetails = {};

      for (const key in jwtPayload) {
        if (key.startsWith('custom:')) {
          userDetails[key.replace('custom:', '')] = jwtPayload[key];
        }
      }

      req['user'] = userDetails as IJwtDecodedToken;

      next();
    } catch (error) {
      this.logger.error(error);
      if (error instanceof AppError) {
        throw new AppError(ErrorCode[error.responseCode], error.message);
      }

      throw new AppError(ErrorCode['0007']);
    }
  }
}
