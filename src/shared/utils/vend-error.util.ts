import { TransactionStatus } from '../enums';
import { IVendResponse } from 'src/modules/client-module/third-parties-module/interfaces';

import { IRequeryResponse } from '../interfaces';

export function handleVendError(
  error,
  body,
  url: string,
  apiUsed: string,
): IVendResponse {
  const vend_status: TransactionStatus = TransactionStatus.IN_PROGRESS;

  return {
    api_used: apiUsed,
    status: vend_status,
    api_response: error,
    api_request: body,
    api_request_url: url,
  };
}

export function handleRequeryError(
  requeryResponse,
  url: string,
  body,
): IRequeryResponse {
  return {
    status: TransactionStatus.IN_PROGRESS,
    api_requery_request_payload: body,
    api_requery_response_payload: requeryResponse,
    api_request_url: url,
  };
}
