import { BadRequestException } from '@nestjs/common';

export default class AppValidationError extends BadRequestException {
  constructor(message: string) {
    // Safely pass message to NestJS's BadRequestException
    super({
      statusCode: 400,
      error: 'Validation Error',
      message,
    });
  }
}
