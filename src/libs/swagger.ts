import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const configureSwagger = (app: INestApplication): void => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('iRecharge V2')
    .setDescription('Comprehensive documentation for the AIRTIME-DATA SERVICE')
    .setVersion('2.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'CashierJWT' },
      'CashierJWT',
    )
    .addTag(
      'AIRTIME-DATA SERVICE',
      'Documentation for the AIRTIME-DATA SERVICE API endpoints',
    )
    .setExternalDoc('Postman Collection', '/documentation-json')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('documentation', app, document);
};
