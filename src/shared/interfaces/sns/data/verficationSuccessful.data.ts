import { IValidateDataResponse } from '../../class';

export interface IVerficationSuccessful {
  userId: string;
  client_response: IValidateDataResponse;
  environment: string;
}
