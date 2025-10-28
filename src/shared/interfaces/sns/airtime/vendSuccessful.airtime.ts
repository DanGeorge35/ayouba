import { IWalletResponsePayload } from 'src/modules/common-module';
import { IClientVendAirtimeResponse } from '../../class';

export interface IVendSuccessfulAirtime {
  transaction_id: string;
  api_used: string;
  walletResponse: IWalletResponsePayload;
  customer_paymethod: string;
  client_response: IClientVendAirtimeResponse;
}
