import { GenericObjectType } from './global';

export function FormatTransactionResponse(transaction: GenericObjectType) {
  return {
    transaction_reference: transaction.client_transaction_reference,
    user_id: transaction.user_id,
    provider: transaction.provider,
    receiver: transaction.receiver,
    package: transaction.package,
    amount: transaction.amount,
    commission: transaction.commission_amount,
    date: transaction.transaction_date,
    status: transaction.status,
    payment_method: transaction.payment_method,
    merchant_code: transaction.merchant_code,
    payment_reference: transaction.payment_reference,
  };
}
