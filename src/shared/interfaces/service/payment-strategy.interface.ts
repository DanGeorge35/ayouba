import {
  IPaymentRequestPayload,
  IPaymentResponsePayload,
} from 'src/modules/client-module/payment';
import { ICommissionResult } from 'src/modules/database-module/schema';

export interface IPaymentStrategy {
  execute(
    payload: IPaymentRequestPayload,
    commision?: ICommissionResult,
  ): Promise<IPaymentResponsePayload>;
  paymentMethod(): string;
}
