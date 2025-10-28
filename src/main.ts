/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import * as express from 'express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import AppValidationError from './shared/utils/AppValidationError';
import { configureSwagger } from './libs/swagger';
import configuration from './libs/configuration';
// import { PrefixMiddleware } from './shared';

const config = configuration();

async function bootstrap() {
  const logger = new Logger();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const seederService = app.get(TvBundleSeederService);
  // try {
  //   await seederService.seed();
  // } catch (error) {
  //   console.error(error);
  // }

  app.setGlobalPrefix('api/v2');

  // app.use(new PrefixMiddleware().use);

  app.use(express.json({ limit: '3mb' }));
  app.use(express.urlencoded({ extended: true, limit: '3mb' }));

  // app.use(compression());

  app.set('trust proxy', true);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []): Error => {
        if (!validationErrors.length) {
          return new AppValidationError('Validation failed');
        }

        const firstError = validationErrors[0];
        const constraints = firstError.constraints ?? {};
        const firstKey = Object.keys(constraints)[0];
        const message =
          firstKey && constraints[firstKey]
            ? constraints[firstKey]
            : 'Validation error occurred';

        return new AppValidationError(message);
      },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'POST, GET, OPTIONS, DELETE, PATCH',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, token, X-Forwarded-For, x-hmac-signature, X-Hmac-Signature, X-Request-Medium',
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'frame-ancestors': ["'self'"],
        },
      },
      frameguard: { action: 'deny' },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }),
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, max-age=0',
    );
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  app.enableCors({
    origin: '*',
    methods: ['POST', 'GET', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'token',
      'Accept',
      'x-hmac-signature',
      'X-HMAC-SIGNATURE',
      'X-Hmac-Signature',
      'X-Request-Medium',
    ],
  });

  app.enableCors({
    origin: '*',
    methods: 'POST, GET, PATCH',
    credentials: true,
    allowedHeaders:
      'Content-Type, Authorization, X-Requested-With, token, Accept, x-hmac-signature, X-HMAC-SIGNATURE, X-Hmac-Signature, X-Request-Medium',
  });

  if (config.app.debug === 'true') {
    configureSwagger(app);
  }

  await app.listen(config.app.port, () => {
    logger.warn(`
      -----------------------------------------------------------
      AirtimeData Service Started Now!
      BASE URL: http://localhost:${config.app.port}/api/v2/
      API Docs: http://localhost:${config.app.port}/documentation
      -----------------------------------------------------------
    `);
  });
}

bootstrap();
