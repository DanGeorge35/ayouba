import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';

import { MerchantSettingsService } from 'src/modules/cms-admin-module/merchant-settings';
import { TvValidationService } from 'src/modules/client-module/tv';
import { TvTransactionService } from 'src/modules/bill-vending-transaction-item-module/tv-transaction';
import { VendTvRequestDto } from 'src/modules/client-module/tv/dtos/accelerate-user';

@Injectable()
export class ValidateTvPurchaseLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ValidateTvPurchaseLimitMiddleware.name);

  constructor(
    private readonly validationService: TvValidationService,
    private readonly dataTransactionService: TvTransactionService,
    private readonly merchantSettingsService: MerchantSettingsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const body: VendTvRequestDto = req.body;
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
      const merchantDayTvTransaction =
        await this.dataTransactionService.sumTodaysTransactions({
          merchant_code,
        });

      if (Number(merchantDayTvTransaction) + amount > purchaseLimit) {
        throw new AppError(
          ErrorCode['0009'],
          'Dashboard Daily limit reached: Kindly Contact Admin.',
        );
      }
    }

    next();
  }
}
