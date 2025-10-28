export const ResponseCodes = {
  // Handler for all successful requests | Code: '200'
  '0000': {
    type: 'success',
    status: 'OK',
    code: '00',
    message: 'Successful',
  },

  // Handler for requerying | Code: '202',
  '0001': {
    type: 'success',
    status: 'OK',
    code: '01',
    message: 'Successful, will be processed later',
  },

  // Handler for all failed requests or validation or Not Found requests | Code: '400',
  '0002': {
    type: 'error',
    status: 'FAIL',
    code: '02',
    message: 'Request failed',
  },

  // Handler for wallet failures | Code: '402',
  '0003': {
    type: 'error',
    status: 'FAIL',
    code: '03',
    message: 'Insufficient wallet balance',
  },

  // Handler for third party failures | Code: '502',
  '0004': {
    type: 'error',
    status: 'FAIL',
    code: '04',
    message: 'Provider failure',
  },

  // Handler for invalid credentials (pin, authentication...) | Code: '401',
  '0005': {
    type: 'error',
    status: 'DENIED',
    code: '05',
    message: 'Invalid access key or credential',
  },

  // Handler for service not available | Code: '503',
  '0006': {
    type: 'error',
    status: 'DENIED',
    code: '06',
    message: 'Service unavailable',
  },

  // Handler for system failure | Code: '500',
  '0007': {
    type: 'error',
    status: 'DENIED',
    code: '07',
    message: 'System failure',
  },

  // Handler for not found | Code: '404',
  '0008': {
    type: 'error',
    status: 'FAIL',
    code: '08',
    message: 'Not found',
  },

  '0009': {
    type: 'error',
    status: 'DENIED',
    code: '09',
    message: 'Permissions not enough',
  },

  '0010': {
    type: 'error',
    status: 'DENIED',
    code: '10',
    message: 'Too many requests',
  },
};
