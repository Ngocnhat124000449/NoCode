import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

const server = express();
let bootstrapError: Error | null = null;

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn'],
    });

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
      .split(',')
      .map(o => o.trim())
      .filter(Boolean);
    app.enableCors({
      origin: allowedOrigins.length ? allowedOrigins : false,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    });

    const httpAdapter = app.getHttpAdapter();
    httpAdapter.get('/health', (_req: unknown, res: { json: (o: object) => void }) => {
      res.json({ status: 'ok', uptime: process.uptime() });
    });

    await app.init();
  } catch (err) {
    bootstrapError = err as Error;
    console.error('[bootstrap] NestJS init failed:', err);
    server.use((_req: unknown, res: any) => {
      res.status(503).json({
        status: 'error',
        message: 'Service initialisation failed',
        detail: bootstrapError?.message,
      });
    });
  }
}

const ready = bootstrap();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ready;
  server(req, res);
}
