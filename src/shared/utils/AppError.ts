import { ErrorCode } from '../enums';
import { ResponseCodes } from './ResponseCodes';

class AppError extends Error {
  message: string;
  isOperational: boolean;
  responseCode: string;
  responseBody;

  constructor(responseCode: ErrorCode, message?: string) {
    super();

    this.isOperational = true;
    this.message = message ? message : ResponseCodes[responseCode].message;
    this.responseCode = responseCode;
    this.responseBody = ResponseCodes[responseCode];

    Error.captureStackTrace(this, this.constructor);
  }

  httpStatus() {
    switch (this.responseBody?.status) {
      case 'OK':
        if (this.responseBody.code == '00') {
          return 200;
        }

        if (this.responseBody.code == '01') {
          return 202;
        }
        break;

      case 'FAIL':
        if (this.responseBody.code == '02') {
          return 400;
        }

        if (this.responseBody.code == '03') {
          return 400;
        }

        if (this.responseBody.code == '08') {
          return 404;
        }

        return 400;
      case 'DENIED':
        if (this.responseBody.code == '05') {
          return 401;
        }

        if (this.responseBody.code == '06') {
          return 502;
        }

        if (this.responseBody.code == '09') {
          return 403;
        }

        if (this.responseBody.code == '10') {
          return 429;
        }

        break;

      default:
        return 500;
    }
  }
}

export default AppError;
