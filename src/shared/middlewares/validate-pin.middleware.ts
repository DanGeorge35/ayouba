import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import { PinService } from 'src/modules/client-module/pin';

@Injectable()
export class ValidatePinMiddleware implements NestMiddleware {
  constructor(private readonly pinService: PinService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { pin } = req.body;

    if (!pin) {
      throw new AppError(ErrorCode['0005'], 'Pin is required');
    }

    await this.pinService.comparePin(pin, req['user'].user_id);

    const maskPin = '******';
    req.body.pin = maskPin;
    next();
  }
}
