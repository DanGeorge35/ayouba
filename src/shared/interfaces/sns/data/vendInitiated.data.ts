import { TransactionStatus } from 'src/shared/enums';

export interface IVendInitiated {
  validation_reference: string;
  pin?: string;
  transaction_reference: string;
  user_id: string;
  status: TransactionStatus;
  transaction_id: string;
  environment: string;
}
