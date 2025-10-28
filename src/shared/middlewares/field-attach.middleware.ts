import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class FieldAttachMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const headerPlatform = req.headers['x-platform'] as string | undefined;

    const platform = headerPlatform || 'unknown';

    (req as Request & { platform: string }).platform = platform;

    next();
  }
}
