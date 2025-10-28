import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { AxiosError } from 'axios';
import { Response } from 'express';
import { ErrorCode, ResponseCodes, ResponseFormat } from 'src/shared';
import AppError from './AppError';
import AppValidationError from './AppValidationError';
import { SlackNotifier, extractErrorLogDetails } from './SlackNotifier';
import {
  IrechargeLegacyResponseFormat,
  ResponseCodes as LegacyResponseCodes,
} from 'src/modules/irecharge-legacy-module/shared/utils';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const sanitizedBody = { ...request.body };
    if ('pin' in sanitizedBody) {
      sanitizedBody.pin = '******';
    }
    exception.requestBody = JSON.stringify(sanitizedBody) ?? 'N/A';
    exception.userType = request['user']?.['user_type'] ?? 'N/A';

    this.logger.error('AIRTIME-DATA SERVICE ERROR', exception);

    // console.log('AIRTIME-DATA SERVICE ERROR', exception);

    try {
      const slack = new SlackNotifier();

      const errorDetails = extractErrorLogDetails(
        exception,
        request.url,
        request,
      );

      const slackMessage = {
        title: exception.message,
        messageBody: errorDetails,
      };

      slack.notifyError(slackMessage);
    } catch (error) {
      this.logger.error(error);
    }
    const url = request?.url?.toLowerCase();
    const errorTypes = [
      'casterror',
      'referenceerror',
      'typeerror',
      'validationerror',
      'mongoservererror',
      'syntaxerror',
      'rangeerror',
      'urierror',
    ];
    if (exception instanceof AppError) {
      ResponseFormat.handleAppErrorResponse(
        response,
        exception.responseCode,
        exception.httpStatus(),
        exception.message,
      );
    } else if (exception instanceof AppValidationError) {
      ResponseFormat.sendResponse(
        response,
        ResponseCodes['0002'],
        undefined,
        exception.message,
        400,
      );
    } else if (exception instanceof AxiosError) {
      ResponseFormat.handleAppErrorResponse(response, '0006', 400);
    } else if (
      exception.name === 'JsonWebTokenError' ||
      exception.name === 'TokenExpiredError'
    ) {
      ResponseFormat.handleAppErrorResponse(response, '0005', 401);
    } else if (exception instanceof NotFoundException) {
      ResponseFormat.handleAppErrorResponse(
        response,
        ErrorCode['0004'],
        404,
        exception.message,
      );
    } else if (errorTypes.includes(exception?.name?.toLowerCase())) {
      if (
        url?.includes('vend_airtime.php') ||
        url?.includes('vend_data.php') ||
        url?.includes('vend_tv.php')
      ) {
        //Legacy API merchant
        const responseData = {
          status: LegacyResponseCodes['0051'].code,
          message: 'An error occurred. Please requery to confirm status',
        };

        return IrechargeLegacyResponseFormat.successResponse(
          response,
          responseData,
        );
      } else if (url?.includes('vend')) {
        //Accelerate API merchant
        ResponseFormat.requeryResponse(
          response,
          null,
          'An error occurred. Please requery to confirm status',
        );
      }
      ResponseFormat.handleAppErrorResponse(response, '0002', 400);
    } else {
      ResponseFormat.handleAppErrorResponse(response, '0007', 500);
    }
  }
}
