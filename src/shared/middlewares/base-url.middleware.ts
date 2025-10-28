import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PrefixMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const prefixMap: Record<string, string> = {
      '/pwr_api_live/v2': '/api/v2/pwr_api_live/v2',
    };

    for (const legacyPrefix of Object.keys(prefixMap)) {
      if (req.url.startsWith(legacyPrefix)) {
        req.url = req.url.replace(legacyPrefix, prefixMap[legacyPrefix]);
        break;
      }
    }

    next();
  }
}
