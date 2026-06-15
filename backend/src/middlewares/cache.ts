import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../services/redis';
import { logger } from '../logger';

type KeyFn = (req: Request) => string;

export function cacheMiddleware(keyOrFn: string | KeyFn, ttlSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = typeof keyOrFn === 'function' ? keyOrFn(req) : keyOrFn;

    try {
      const cached = await redisClient.get(key);
      if (cached !== null) {
        logger.debug({ key }, 'Cache hit');
        res.json(JSON.parse(cached));
        return;
      }
    } catch (err) {
      logger.error({ err, key }, 'Erro ao ler cache Redis — fallback para MongoDB');
      next();
      return;
    }

    // Override res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redisClient
          .set(key, JSON.stringify(body), 'EX', ttlSeconds)
          .catch((err) => logger.error({ err, key }, 'Erro ao gravar cache Redis'));
      }
      return originalJson(body);
    };

    next();
  };
}
