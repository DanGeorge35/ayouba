/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequeryDto } from 'src/modules/client-module/airtime/dtos/requery-airtime.dto';
import { TransactionStatus } from 'src/shared';

export interface IRequeryResponse {
  status: TransactionStatus;
  api_requery_request_payload: any;
  api_requery_response_payload: any;
  api_request_url?: string;
}

export interface IClientRequeryResponse {
  amount: string;
  receiver: string;
  transaction_reference: string;
  provider: string;
  transaction_date: string;
  status: TransactionStatus;
  email?: string;
  package?: string;
  payment_reference?: string;
}

export interface IMerchantRequeryResponse {
  amount: string;
  receiver: string;
  transaction_reference: string;
  provider: string;
  transaction_date: string;
  status: TransactionStatus;
  email?: string;
  package?: string;
  merchant_code: string;
  payment_reference?: string;
}

export interface IRequeryService {
  requery(requeryDto: RequeryDto): Promise<IClientRequeryResponse>;
}
