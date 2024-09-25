export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  redis: process.env.redis || 'redis://localhost:6379',
});
