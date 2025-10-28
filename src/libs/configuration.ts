import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

export default registerAs('config', () => ({
  app: {
    url: process.env.API_URL || '',
    env: process.env.APP_ENV || 'development',
    name: process.env.APP_NAME || 'App',
    timezone: process.env.APP_TIMEZONE || 'Africa/Lagos',
    port: Number(process.env.APP_PORT) || 3000,
    debug: process.env.APP_DEBUG ? 'true' : 'false',
    timeout: Number(process.env.APP_TIMEOUT_MILLISECONDS) || 180000,
    serviceTimeout: Number(process.env.SERVICE_TIMEOUT_MILLISECONDS) || 40000,
  },

  database: {
    url: process.env.DATABASE_URL || '',
    username: process.env.DATABASE_USERNAME || '',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || '',
    port: Number(process.env.DATABASE_PORT) || 5432,
    host: process.env.DATABASE_HOST || '',
    dialect: process.env.DATABASE_DIALECT || 'postgres',
  },
}));
