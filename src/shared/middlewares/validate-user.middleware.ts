import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { CustomerCategories, ErrorCode } from '../enums';
import { IJwtDecodedToken } from '../interfaces';
import configuration from 'src/libs/configuration';
import { JwtService } from '@nestjs/jwt';

const config = configuration();

@Injectable()
export class ValidateUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateUserMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { authorization: tokenHeader } = req.headers;

    if (!tokenHeader) {
      throw new AppError(
        ErrorCode['0005'],
        'Access denied. User authentication required.',
      );
    }

    const token = tokenHeader?.split(' ')[1];

    const userDetails = await this.jwtService.verifyAsync(token, {
      secret: config.accelerate.userSecret,
    });

    if (
      userDetails.kyc_status.toLowerCase() !== 'approved' ||
      !userDetails.wallet_id
    ) {
      throw new AppError(
        ErrorCode['0009'],
        'You are not authorized to carry out this operation',
      );
    }

    if (req.path.includes('/vend') || req.path.includes('/validate')) {
      if (
        userDetails.business_type.toLowerCase() ==
        CustomerCategories.SUPER_MERCHANT
      ) {
        throw new AppError(
          ErrorCode['0005'],
          'As a super-merchant, You are not authorized to carry out this operation, contact admin',
        );
      }
    }

    req['user'] = userDetails as IJwtDecodedToken;
    req['requestTimestamp'] = new Date();
    next();
  }
}
