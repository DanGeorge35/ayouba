import { TransactionStatus } from 'src/shared/enums';

export interface IVendInitiatedAirtime {
  pin?: string;
  validation_reference: string;
  transaction_reference: string;
  transaction_id: string;
  status: TransactionStatus;
  user_id: string;
  environment: string;
}
