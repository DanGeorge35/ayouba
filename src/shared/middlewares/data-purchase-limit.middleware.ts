import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';

import { MerchantSettingsService } from 'src/modules/cms-admin-module/merchant-settings';
import { DataTransactionService } from 'src/modules/bill-vending-transaction-item-module/data-transaction/services/data-transaction.service';
import {
  DataValidationService,
  VendDataRequestDto,
} from 'src/modules/client-module/data';

@Injectable()
export class ValidateDataPurchaseLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(
    ValidateDataPurchaseLimitMiddleware.name,
  );

  constructor(
    private readonly validationService: DataValidationService,
    private readonly dataTransactionService: DataTransactionService,
    private readonly merchantSettingsService: MerchantSettingsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const body: VendDataRequestDto = req.body;
    const transaction = await this.validationService.getValidationRecord({
      validation_reference: body.validation_reference,
      user_id: req['user']?.user_id,
    });
    const amount = Number(transaction.amount);
    const merchant_code = req['user']?.merchant_code;

    if (!merchant_code) {
      throw new AppError(
        ErrorCode['0005'],
        'You are not authorized to perform this action.',
      );
    }
    const merchantSettings =
      await this.merchantSettingsService.findOne(merchant_code);

    const purchaseLimit = merchantSettings.daily_data_limit;
    if (purchaseLimit > 0) {
      const merchantDayDataTransaction =
        await this.dataTransactionService.sumTodaysTransactions({
          merchant_code,
        });

      if (Number(merchantDayDataTransaction) + amount > purchaseLimit) {
        throw new AppError(
          ErrorCode['0009'],
          'Dashboard Daily limit reached: Kindly Contact Admin.',
        );
      }
    }

    next();
  }
}
