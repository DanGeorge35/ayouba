import { ICommissionResult } from 'src/modules/database-module/schema';
import { TransactionStatus } from 'src/shared';

export interface IValidateAirtimeResponse {
  validation_reference: string;
  provider: string;
  receiver: string;
  transaction_date: string;
  amount: string;
  email?: string;
  phone_number?: string;
  country_code?: string;
  package?: string;
  status: TransactionStatus;
  commission_breakdown?: ICommissionResult;
}

export interface IValidateDataResponse {
  validation_reference: string;
  receiver: string;
  provider: string;
  package: string;
  transaction_date: string;
  amount: string;
  email?: string;
  phone_number?: string;
  status: TransactionStatus;
  service_id?: string;
  commission_breakdown?: ICommissionResult;
}

export interface IClientVendAirtimeResponse {
  message?: string;
  amount: string;
  receiver?: string;
  wallet_balance?: number;
  payment_reference: string;
  transaction_reference: string;
  provider: string;
  transaction_date: string;
  status: TransactionStatus;
  phone_number?: string;
  email?: string;
  merchant_code?: string;
  transaction_id?: string;
  validation_reference?: string;
}

export interface IClientVendTvResponse {
  provider: string;
  package: string;
  amount: string;
  receiver: string;
  payment_reference: string;
  wallet_balance: number;
  transaction_reference: string;
  status: string;
  email: string;
  customer_number: string;
  transaction_date: string;
  merchant_code: string;
  user_id: string;
  environment: string;
  logo: string;
  customer_name: string;
  due_date: string;
  transaction_id: string;
  validation_reference: string;
  message?: string;
}

export interface ISuperMerchantVendAirtimeResponse {
  amount: string;
  receiver: string;
  transaction_reference: string;
  provider: string;
  transaction_date: string;
  status: TransactionStatus;
  phone_number?: string;
  email?: string;
  merchant_code?: string;
  validation_reference: string;
}

export interface IClientVendDataResponse {
  message?: string;
  amount: string;
  receiver: string;
  wallet_balance?: number;
  payment_reference?: string;
  transaction_reference: string;
  package: string;
  provider?: string;
  transaction_date: string;
  status: TransactionStatus;
  phone_number?: string;
  email?: string;
  merchant_code?: string;
  transaction_id?: string;
  validation_reference?: string;
}
export interface IDataTransactionDetailsResponseData {
  payment_reference: string;
  transaction_id: string;
  provider: string;
  receiver: string;
  package: string;
  amount: string;
  amount_charged: number;
  transaction_date: string;
  commission_amount: number;
  transaction_type: string;
  payment_method: string;
  status: string;
  device: string;
  hits: number;
  date_modified: string;
  date: string;
  ip: string;
}

export interface IAirtimeTransactionDetailsResponseData {
  payment_reference: string;
  transaction_id: string;
  provider: string;
  receiver: string;
  amount: string;
  amount_charged: number;
  transaction_date: string;
  commission_amount: number;
  transaction_type: string;
  payment_method: string;
  status: string;
  device: string;
  hits: number;
  date_modified: string;
  date: string;
  ip: string;
}

export interface IAirtimeTransactionPaymentResponseData {
  transaction_id: string;
  merchant_id: string;
  provider: string;
  amount: string;
  receiver: string;
  date: string;
  status: TransactionStatus;
}

export interface IDataTransactionPaymentResponseData {
  transaction_id: string;
  merchant_id: string;
  provider: string;
  package: string;
  amount: string;
  reciever: string;
  date: string;
  status: TransactionStatus;
}
