import { RedisOptions } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

export const queueConnection: RedisOptions = {
  host: process.env.REDIS_HOST || 'redis', // app is running inside docker container, so we need to use the service name as host
  port: Number(process.env.REDIS_PORT) || 6379, // app is running inside docker container, so we need to use the service name as host
  password: process.env.REDIS_PASSWORD,
};