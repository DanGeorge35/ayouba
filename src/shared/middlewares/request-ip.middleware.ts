import { Logger } from '@nestjs/common';
import { Request } from 'express';

export class ClientIp {
  static readonly logger = new Logger(ClientIp.name);
  static getClientIp(request: Request): {
    ip_address_v4: string;
    ip_address_v6: string;
  } {
    try {
      const forwardedFor = request.headers['x-forwarded-for'];
      let ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor || request.ip || request.connection.remoteAddress;

      if (ip && ip.includes('::ffff:')) {
        ip = ip.split('::ffff:')[1];
      }

      if (ip === '::1') {
        ip = '127.0.0.1';
      }
      return {
        ip_address_v4: ip?.trim() || '',
        ip_address_v6: request.ip || '',
      };
    } catch (error) {
      this.logger.error('Client IP ERROR', JSON.stringify(error));
    }
  }
}
