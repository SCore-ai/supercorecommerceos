import { Redis } from 'ioredis';
import { getEnv } from '../env.js';

let redis: Redis | undefined;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
    });
  }
  return redis;
}

export async function pingRedis(): Promise<void> {
  const result = await getRedis().ping();
  if (result !== 'PONG') {
    throw new Error('Redis ping failed');
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = undefined;
  }
}
