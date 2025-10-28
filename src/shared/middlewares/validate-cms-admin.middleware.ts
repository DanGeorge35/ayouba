import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { IJwtDecodedToken } from '../interfaces';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import configuration from 'src/libs/configuration';

const config = configuration();

@Injectable()
export class ValidateCmsAdminMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateCmsAdminMiddleware.name);

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

      req['user'] = userDetails;

      next();
    } catch (error) {
      this.logger.log(error);

      throw new AppError(
        ErrorCode['0005'],
        'An error occured during authentication',
      );
    }
  }
}
