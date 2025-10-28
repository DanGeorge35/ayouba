import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { BusinessType, ErrorCode } from '../enums';
import { IJwtDecodedToken } from '../interfaces';
import configuration from 'src/libs/configuration';
import {
  AwsCognitoService,
  ICognitoConfigurePayload,
} from 'src/modules/aws-module';

const config = configuration();

@Injectable()
export class CognitoMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CognitoMiddleware.name);

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

      const userDetails: Record<string, string> = {};

      for (const key in jwtPayload) {
        if (key.startsWith('custom:')) {
          userDetails[key.replace('custom:', '')] = jwtPayload[key];
        }
      }

      // TODO: Check if user is active
      if (
        userDetails.kyc_status.toLowerCase() !== 'approved' ||
        !userDetails.wallet_id
        // !userDetails.is_active
      ) {
        throw new AppError(
          ErrorCode['0005'],
          'You are not authorized to carry out this operation, contact admin',
        );
      }

      if (userDetails.business_type.toLowerCase() === BusinessType.START_UP) {
        throw new AppError(
          ErrorCode['0005'],
          'You are not authorized to carry out this operation, contact admin',
        );
      }

      req['user'] = userDetails as unknown as IJwtDecodedToken;

      next();
    } catch (error) {
      this.logger.error(error);
      throw new AppError(
        ErrorCode['0005'],
        'An error occured while authenticating user',
      );
    }
  }
}

export class SuperMerchantCognitoMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CognitoMiddleware.name);

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
    try {
      // TEMPORARY: Bypass authentication for testing
      // if (config.app.debug === 'true') {
      //   // Hardcoded super merchant user for testing
      //   req['user'] = {
      //     user_id: 'test-super-merchant-id',
      //     wallet_id: '12345',
      //     merchant_id: '3eb5e899-6762-4079-a84e-29df9de4adaf',
      //     merchant_code: 'TEST_SM',
      //     kyc_status: 'approved',
      //     business_type: 'super-merchant',
      //     user_category: 'SUPER_MERCHANT',
      //     permissions: {
      //       billing_vending: ['can-vend-data', 'can-view-bv-transaction'],
      //     },
      //   };
      //   return next();
      // }

      const { authorization: tokenHeader } = req.headers;

      if (!tokenHeader) {
        throw new AppError(
          ErrorCode['0005'],
          'Access denied. User authentication required.',
        );
      }

      const token = req.headers.authorization?.split(' ')[1];
      const jwtPayload = await this.cognitoService.verifyToken(token);

      const userDetails: Record<string, string> = {};

      for (const key in jwtPayload) {
        if (key.startsWith('custom:')) {
          userDetails[key.replace('custom:', '')] = jwtPayload[key];
        }
      }

      if (
        userDetails.kyc_status.toLowerCase() !== 'approved' ||
        !userDetails.wallet_id
      ) {
        throw new AppError(
          ErrorCode['0005'],
          'You are not authorized to carry out this operation, contact admin',
        );
      }

      if (userDetails.business_type.toLowerCase() !== 'super-merchant') {
        throw new AppError(
          ErrorCode['0005'],
          'You are not authorized to carry out this operation, contact admin',
        );
      }

      req['user'] = userDetails as unknown as IJwtDecodedToken;

      next();
    } catch (error) {
      this.logger.error(error);
      throw new AppError(
        ErrorCode['0005'],
        'An error occured while authenticating user',
      );
    }
  }
}
