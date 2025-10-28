import {
  InitiateDataRequestDto,
  MerchantInitiateDataRequestDto,
  VendDataRequestDto,
  VendMerchantDataRequestDto,
} from 'src/modules/client-module/data';
import {
  CustomerCategories,
  IClientVendDataResponse,
  IValidateDataResponse,
} from 'src/shared';

export interface IDataService {
  initiateTransaction(
    payload: InitiateDataRequestDto | MerchantInitiateDataRequestDto,
    userId: string,
    customerCategory: CustomerCategories,
    catchOnRedis: boolean,
  ): Promise<IValidateDataResponse>;

  vend(
    payload: VendDataRequestDto | VendMerchantDataRequestDto,
    userId: string,
    walletId: number,
    userCategory: string,
    customerCategory: CustomerCategories,
  ): Promise<IClientVendDataResponse>;

  getPackageByCode(provider: string, packageCode: string);

  getPackages(provider: string);
}
