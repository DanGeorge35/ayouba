export const notFoundResponse = {
  status: 'FAIL',
  code: '08',
  message: 'transaction record not found',
};

export const unauthorizedRequest = {
  status: 'DENIED',
  code: '05',
  message: 'An error occured while authenticating user',
};

export const badRequest = {
  status: 'FAIL',
  code: '02',
  message: 'Provider record does not exist',
};

export const invalidRequest = {
  status: 'FAIL',
  code: '02',
  message: 'Invalid transaction record',
};
