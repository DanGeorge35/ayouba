export interface AuditLogPayload {
  payload: ILogPayload;
}
export interface ILogPayload {
  user_id: string; // Cms user id
  action: string; // REPROCESS
  action_url: string; // REQUEST URL
  service_name: string; // AIRTIME|DATA|POWER
  description?: string;
  request_body?: string; // REQUEST PAYLOAD
  response_body?: string; //API RESPONSE
  ip_address_v6?: string;
  ip_address_v4: string; //IP4 ADDRESS
  http_method: string; // API METHOD
  status: string | AuditLogStatus; //successful, failed
}

export enum AuditLogStatus {
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

export interface IAuditUser {
  user_id: string;
  ip_address_v6: string;
  ip_address_v4: string;
  method_called: string;
  action_url: string;
}
