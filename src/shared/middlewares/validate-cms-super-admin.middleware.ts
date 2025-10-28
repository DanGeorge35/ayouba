import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { IJwtDecodedToken } from '../interfaces';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import configuration from 'src/libs/configuration';

const config = configuration();

@Injectable()
export class ValidateCmsSuperAdminMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateCmsSuperAdminMiddleware.name);

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      const { authorization: tokenHeader } = req.headers;

      if (!tokenHeader) {
        throw new AppError(
          ErrorCode['0005'],
          'Access denied. User authentication required.',
        );
      }

      const token = tokenHeader?.split(' ')[1];

      const userDetails: IJwtDecodedToken = jwt.verify(
        token,
        config.accelerate.cmsAdminSecret,
      ) as IJwtDecodedToken;

      const role: unknown = userDetails['role'];

      if (req.method === 'POST' || req.method === 'PATCH') {
        if (role !== 'super-admin') {
          throw new AppError(
            ErrorCode['0009'],
            'Access denied. User is not a super-admin.',
          );
        }
      }

      req['user'] = userDetails;

      next();
    } catch (error) {
      this.logger.log(error);

      throw new AppError(
        ErrorCode[error.responseCode ?? '0005'],
        error.message ?? 'An error occured during authentication',
      );
    }
  }
}
