import Redis from 'ioredis';
import { logger } from '../logger';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

export const redisClient = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

export const redisSub = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  logger.info('Redis publisher conectado');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Erro no cliente Redis publisher');
});

redisSub.on('connect', () => {
  logger.info('Redis subscriber conectado');
});

redisSub.on('error', (err) => {
  logger.error({ err }, 'Erro no cliente Redis subscriber');
});

export async function connectRedis(): Promise<void> {
  try {
    await redisClient.connect();
    await redisSub.connect();
  } catch (err) {
    logger.error({ err }, 'Falha ao conectar ao Redis — continuando sem cache');
  }
}
