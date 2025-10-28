import { Response } from 'express';
import { ResponseCodes } from './ResponseCodes';
import { TransactionStatus } from '../enums';
import { HttpStatus } from '@nestjs/common';

export class ResponseFormat {
  /**
   * Sends default JSON resonse to client
   * @param {*} code
   * @param {*} data
   * @param {*} message
   * @param {*} code
   */
  static successResponse<T>(
    res: Response,
    data: T,
    message: string,
    code: number = 200,
  ) {
    this.sendResponse(res, ResponseCodes['0000'], data, message, code);
  }

  /**
   * Sends default JSON resonse to client
   * @param {*} code
   * @param {*} data
   * @param {*} message
   * @param {*} code
   */
  static okResponse(res: Response, message: string, code: number = 200) {
    const response = {
      status: 'OK',
      code: '00',
      message: message,
    };

    res.status(code).json(response);
  }

  /**
   * Sends default JSON resonse to client
   * @param {*} code
   * @param {*} data
   * @param {*} message
   * @param {*} code
   */
  static requeryResponse<T>(
    res: Response,
    data: T,
    message: string,
    code: number = 202,
  ) {
    this.sendResponse(res, ResponseCodes['0001'], data, message, code);
  }

  /**
   * Sends default JSON resonse to client
   * @param {*} code
   * @param {*} data
   * @param {*} message
   * @param {*} code
   */
  static failureResponse<T>(
    res: Response,
    data: T,
    message: string,
    code: number = 400,
  ) {
    this.sendResponse(res, ResponseCodes['0002'], data, message, code);
  }

  static handleAppErrorResponse(
    res: Response,
    errorCode: string,
    code: number = 200,
    message?: string,
  ) {
    this.sendResponse(
      res,
      ResponseCodes[errorCode],
      undefined,
      message || undefined,
      code,
    );
  }

  static sendResponse(
    res: Response,
    resDataType,
    data,
    message: string,
    code: HttpStatus = HttpStatus.OK,
  ) {
    if (data && typeof data === 'object' && 'status' in data) {
      if (data.status === TransactionStatus.FULFILLED) {
        code = HttpStatus.OK; //200
      } else if (data.status === TransactionStatus.IN_PROGRESS) {
        code = HttpStatus.ACCEPTED; //202
      } else if (data.status === TransactionStatus.FAILED && code !== 200) {
        code = HttpStatus.BAD_REQUEST; //400
      }
    }

    const response = {
      status: resDataType?.status ?? 'FAILED',
      code: resDataType?.code ?? '06',
      message: message ?? resDataType?.message,
      data: data ?? undefined,
    };

    res.status(code).json(response);
  }
}
