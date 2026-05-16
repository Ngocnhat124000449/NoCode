import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { AbuseDetectionService } from './abuse-detection.service';

@Injectable()
export class BanCheckGuard implements CanActivate {
  constructor(private readonly abuse: AbuseDetectionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { socket: { remoteAddress?: string } }>();
    const ip = req.ip ?? req.socket?.remoteAddress ?? 'unknown';

    const banned = await this.abuse.isBanned(ip);
    if (banned) {
      throw new HttpException(
        { message: 'Access temporarily restricted', code: 'RATE_LIMIT_BAN' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
