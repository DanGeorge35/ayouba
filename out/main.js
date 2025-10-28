"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const helmet_1 = require("helmet");
const express = require("express");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const swagger_1 = require("./libs/swagger");
const configuration_1 = require("./libs/configuration");
// import { PrefixMiddleware } from './shared';
const config = (0, configuration_1.default)();
async function bootstrap() {
    const logger = new common_1.Logger();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
    // app.useGlobalPipes(
    //   new ValidationPipe({
    //     whitelist: true,
    //     forbidNonWhitelisted: true,
    //     transform: true,
    //     transformOptions: {
    //       enableImplicitConversion: true,
    //     },
    //     exceptionFactory: (validationErrors: ValidationError[] = []) => {
    //       const constraints = validationErrors[0]?.constraints || null;
    //       let message = null;
    //       if (typeof constraints == 'object') {
    //         const message_key = Object.keys(validationErrors[0].constraints)[0];
    //         message = validationErrors[0].constraints[message_key];
    //       }
    //       return new AppValidationError(message || 'Validation Error Occured');
    //     },
    //   }),
    // );
    app.enableCors({
        origin: '*',
        methods: 'POST, GET, OPTIONS, DELETE, PATCH',
        credentials: true,
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With, token, X-Forwarded-For, x-hmac-signature, X-Hmac-Signature, X-Request-Medium',
    });
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                'frame-ancestors': ["'self'"],
            },
        },
        frameguard: { action: 'deny' },
        hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    }));
    app.use((req, res, next) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
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
        allowedHeaders: 'Content-Type, Authorization, X-Requested-With, token, Accept, x-hmac-signature, X-HMAC-SIGNATURE, X-Hmac-Signature, X-Request-Medium',
    });
    if (config.app.debug === 'true') {
        (0, swagger_1.configureSwagger)(app);
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
