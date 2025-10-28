import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import { AirtimeTransactionService } from 'src/modules/bill-vending-transaction-item-module/airtime-transaction/services/airtime-transaction.service';

@Injectable()
export class ValidateAirtimeTransactionReference implements NestMiddleware {
  constructor(private readonly transactionService: AirtimeTransactionService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { transaction_reference } = req.body;
    const userId = req['user'].user_id;

    const transactionExists =
      await this.transactionService.isUserTransactionExist({
        client_transaction_reference: transaction_reference,
        user_id: userId,
      });

    if (transactionExists) {
      throw new AppError(ErrorCode['0002'], 'Duplicate Transaction Reference');
    }

    next();
  }
}
