import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RedirectMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'POST' && req.path === '/') {
      return res.redirect(307, '/graphql');
    }
    next();
  }
}
