import { IValidateAirtimeResponse } from '../../class';

export interface IVerficationSuccessfulAirtime {
  userId: string;
  client_response: IValidateAirtimeResponse;
  environment: string;
}
