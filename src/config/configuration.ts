export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  redisUrl: process.env.redis || 'redis://localhost:6379',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
});
