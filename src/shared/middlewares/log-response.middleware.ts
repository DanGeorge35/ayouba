import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Helpers } from '../helpers';
import { RedisService } from 'src/modules/redis-module';
import { RequestType } from './power.enum';
import { IncomingApiRequestService } from '../services/incoming-api-request';
import * as requestIp from 'request-ip';

@Injectable()
export class LogResponseMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LogResponseMiddleware.name);
  constructor(
    private readonly incomingApiRequestService: IncomingApiRequestService,
    private readonly redisService: RedisService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    let responseBody;

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      responseBody = body;
      return originalJson(body);
    };
    res.on('finish', async () => {
      try {
        const user = req['user'];
        const ip = requestIp.getClientIp(req);
        const ipAddressV4 = ip;
        const ipAddressV6 = null;
        const actionUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        if (req.body?.pin) {
          req.body.pin = '******';
        }

        const requestPayload = {
          body: req.body,
          query: req.query,
        };

        const redisKey =
          responseBody?.data?.validation_reference ||
          responseBody?.ref ||
          responseBody?.access_token ||
          null;

        const requestType = this.getRequestType(req.originalUrl);
        const cacheVerification = redisKey
          ? await this.redisService.get(redisKey, requestType)
          : null;
        const transactionReference =
          req?.query?.reference_id ?? req.body?.transaction_reference;
        const transactionID =
          req?.query?.access_token ?? req.body?.validation_reference;
        const incomingApiRequestItem = {
          client_request_payload: JSON.stringify(requestPayload),
          client_response_payload: JSON.stringify(responseBody),
          client_request_url: actionUrl,
          api_request_url: null,
          ip_address_v4: ipAddressV4,
          ip_address_v6: ipAddressV6,
          environment: Helpers.getCurrentEnvironment(),
          request_type: requestType,
          verification_reference:
            cacheVerification?.verification_reference ??
            cacheVerification?.validation_reference ??
            null,
          transaction_id: transactionID ?? cacheVerification?.transaction_id,
          client_transaction_reference:
            transactionReference ??
            cacheVerification?.client_transaction_reference,
          api_request_payload: null,
          api_response_payload: null,
          service: 'airtime-data-tv',
          user_id: user?.user_id ?? null,
          merchant_id: user?.merchant_id ?? null,
          vendor_code: (req.query?.vendor_code as string) ?? null,
          request_timestamp: req['requestTimestamp'] ?? new Date(),
          response_timestamp: new Date(),
          headers: JSON.stringify(req.headers),
          method_called: req.method,
          http_status_code: res.statusCode,
        };

        this.incomingApiRequestService.logRequest(incomingApiRequestItem);
        this.redisService.delete(redisKey, requestType);
      } catch (err) {
        this.logger.log('Incoming API Request', JSON.stringify(err));
      }
    });

    next();
  }

  getRequestType(url: string) {
    const lowerUrl = url.toLowerCase();

    switch (true) {
      case lowerUrl.includes('airtime/vend'):
      case lowerUrl.includes('data/vend'):
      case lowerUrl.includes('tv/vend'):
      case lowerUrl.includes('vend_airtime.php'):
      case lowerUrl.includes('vend_data.php'):
      case lowerUrl.includes('vend_tv.php'):
        return RequestType.VEND;

      case lowerUrl.includes('airtime/validate'):
      case lowerUrl.includes('data/validate'):
      case lowerUrl.includes('tv/validate'):
      case lowerUrl.includes('smile/info'):
      case lowerUrl.includes('get_smartcard_info'):
        return RequestType.VERIFICATION;

      case lowerUrl.includes('requery'):
        return RequestType.REQUERY;

      default:
        return 'General';
    }
  }
}
