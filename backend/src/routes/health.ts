import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { redisClient } from '../services/redis';
import { logger } from '../logger';

const router = Router();

// GET /ready — readiness check (MongoDB + Redis)
router.get('/', async (_req: Request, res: Response) => {
  const checks: { mongo: boolean; redis: boolean } = {
    mongo: false,
    redis: false,
  };

  // Check MongoDB
  try {
    checks.mongo = mongoose.connection.readyState === 1;
  } catch (err) {
    logger.error({ err }, 'Health check: erro ao verificar MongoDB');
    checks.mongo = false;
  }

  // Check Redis
  try {
    const pong = await redisClient.ping();
    checks.redis = pong === 'PONG';
  } catch (err) {
    logger.error({ err }, 'Health check: erro ao verificar Redis');
    checks.redis = false;
  }

  const allHealthy = checks.mongo && checks.redis;

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
  });
});

export default router;
