import { IWalletResponsePayload } from 'src/modules/common-module';
import { IClientVendDataResponse } from '../../class';

export interface IVendSuccessful {
  transaction_id: string;
  api_used: string;
  walletResponse: IWalletResponsePayload;
  customer_paymethod: string;
  client_response: IClientVendDataResponse;
}
