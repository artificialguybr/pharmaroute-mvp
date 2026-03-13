import { app } from './app';
import { env } from './config/env';
import { log } from './middleware/observability';

const server = app.listen(env.PORT, () => {
  log('info', 'server_started', {
    port: env.PORT,
    health: `http://localhost:${env.PORT}/health`,
    ready: `http://localhost:${env.PORT}/ready`,
  });
});

server.keepAliveTimeout = 65_000;
server.requestTimeout = env.REQUEST_TIMEOUT_MS + 5_000;
