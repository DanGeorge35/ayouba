import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';
import { AirtimeTransactionService } from 'src/modules/bill-vending-transaction-item-module/airtime-transaction/services/airtime-transaction.service';
import { VendAirtimeRequestDto } from 'src/modules/client-module/airtime';
import { MerchantSettingsService } from 'src/modules/cms-admin-module/merchant-settings';
import { AirtimeValidationService } from 'src/modules/bill-vending-validation-item-module/airtime-validation/services/airtime-validation.service';

@Injectable()
export class ValidateAirtimePurchaseLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(
    ValidateAirtimePurchaseLimitMiddleware.name,
  );

  constructor(
    private readonly validationService: AirtimeValidationService,
    private readonly airtimeTransactionService: AirtimeTransactionService,
    private readonly merchantSettingsService: MerchantSettingsService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const body: VendAirtimeRequestDto = req.body;
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

    const purchaseLimit = merchantSettings.daily_airtime_limit;
    if (purchaseLimit > 0) {
      const merchantDayAirtimeTransaction =
        await this.airtimeTransactionService.sumTodaysTransactions({
          merchant_code,
        });

      if (Number(merchantDayAirtimeTransaction) + amount > purchaseLimit) {
        throw new AppError(
          ErrorCode['0009'],
          'Dashboard Daily limit reached: Kindly Contact Admin.',
        );
      }
    }

    next();
  }
}
