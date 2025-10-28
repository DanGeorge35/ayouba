import { TransactionStatus } from 'src/shared/enums';

export interface IVendFailedAirtime {
  pin: string;
  validation_reference: string;
  transaction_reference: string;
  status: TransactionStatus.FAILED;
  error: string;
}
