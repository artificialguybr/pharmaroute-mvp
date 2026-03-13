import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

import { env } from './config/env';
import { supabaseAdmin } from './config/supabase';
import { log, logRequests, withRequestContext } from './middleware/observability';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import pharmacyRoutes from './routes/pharmacies';
import scheduleRoutes from './routes/schedules';
import sellerRoutes from './routes/sellers';
import visitRoutes from './routes/visits';

const createRateLimiter = (windowMs: number, max: number) => {
  const bucket = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const current = bucket.get(key);

    if (!current || now >= current.resetAt) {
      bucket.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (current.count >= max) {
      const retryAfterSeconds = Math.ceil((current.resetAt - now) / 1000);
      res.setHeader('retry-after', retryAfterSeconds);
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    current.count += 1;
    bucket.set(key, current);
    return next();
  };
};

const apiLimiter = createRateLimiter(env.API_RATE_LIMIT_WINDOW_MS, env.API_RATE_LIMIT_MAX);
const authLimiter = createRateLimiter(env.API_RATE_LIMIT_WINDOW_MS, env.AUTH_RATE_LIMIT_MAX);

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(withRequestContext);
app.use(logRequests);
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const frontendUrl = env.FRONTEND_URL;
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin) || origin === frontendUrl) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '64kb', parameterLimit: 100 }));
app.use('/api', apiLimiter);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(env.REQUEST_TIMEOUT_MS, () => {
    if (!res.headersSent) {
      log('warn', 'request_timeout', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
      });
      res.status(503).json({ error: 'Request timeout' });
    }
  });
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: env.NODE_ENV,
  });
});

app.get('/ready', async (_req: Request, res: Response) => {
  const { error } = await supabaseAdmin.from('profiles').select('id').limit(1);
  if (error) return res.status(503).json({ status: 'degraded', error: 'database_unavailable' });
  return res.json({ status: 'ready' });
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/pharmacies', pharmacyRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  log('error', 'unhandled_error', {
    requestId: req.requestId,
    message: err.message,
    stack: env.NODE_ENV === 'production' ? undefined : err.stack,
  });
  res.status(500).json({ error: 'Internal Server Error', requestId: req.requestId });
});
