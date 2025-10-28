/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError, timeout, TimeoutError } from 'rxjs';
import AppError from '../utils/AppError';
import { ErrorCode } from '../enums';

@Injectable()
export class TimeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeInterceptor.name);

  constructor(private readonly timeoutInMilliseconds: number) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    this.logger.error(context);

    return next.handle().pipe(
      timeout(this.timeoutInMilliseconds),
      catchError((error) => {
        if (error instanceof TimeoutError) {
          throw new AppError(
            ErrorCode['0001'],
            'Request timed out, please requery!',
          );
        }

        return throwError(() => error);
      }),
    );
  }
}
