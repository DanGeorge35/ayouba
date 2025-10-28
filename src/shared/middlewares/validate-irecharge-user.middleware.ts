import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ErrorCode, IJwtDecodedToken } from 'src/shared';
import AppError from '../utils/AppError';
import { JwtService } from '@nestjs/jwt';
import configuration from 'src/libs/configuration';

const config = configuration();

@Injectable()
export class ValidateIrechargeUserMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateIrechargeUserMiddleware.name);

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
      secret: config.irecharge.jwt.secret,
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

    req['user'] = userDetails as IJwtDecodedToken;
    req['requestTimestamp'] = new Date();

    next();
  }
}
