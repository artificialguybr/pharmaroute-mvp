import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const shouldLog = (level: LogLevel) => levelRank[level] >= levelRank[env.LOG_LEVEL];

export const log = (level: LogLevel, message: string, extra: Record<string, unknown> = {}) => {
  if (!shouldLog(level)) return;

  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...extra,
  };

  const serialized = JSON.stringify(payload);
  if (level === 'error') console.error(serialized);
  else if (level === 'warn') console.warn(serialized);
  else console.log(serialized);
};

export const withRequestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.header('x-request-id') ?? crypto.randomUUID();
  (req as Request & { requestId?: string }).requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};

export const logRequests = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  const requestId = (req as Request & { requestId?: string }).requestId;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    log('info', 'http_request', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Math.round(durationMs),
      userId: req.user?.id ?? null,
      role: req.userRole ?? null,
      userAgent: req.header('user-agent') ?? null,
      ip: req.ip,
    });
  });

  next();
};

