import { CustomerCategories } from 'src/shared/enums';

export interface IJwtDecodedToken {
  id?: string;
  user_id: string;
  merchant_id: string;
  is_active: boolean;
  user_category: CustomerCategories;
  iat?: number;
  exp?: number;
  profit_wallet_id?: number;
  legacy_user_id?: number;
  kyc_status?: string;
  legacy_merchant_id?: number;
  wallet_id?: number;
  permissions: { permissions: string[] }[];
  role: string[];
  business_type: string;
  merchant_code?: string;
  email?: string;
  vendor_code?: string;
  private_key?: string;
  public_key?: string;
  user_type?: CustomerCategories;
  is_super_merchant?: boolean;
  business_name?: string;
  platform?: string;
}

export interface IJwtCashierDecodedToken {
  user_id: string;
  email: string;
  phone: string;
  user_type: 'cashier';
  transaction_limit: number;
  region_id: string;
  region_name: string;
  sale_point_id: string;
  sales_point_name: string;
  is_first_login: boolean;
  status: 'active' | 'inactive';
  iat: number;
  exp: number;
}
