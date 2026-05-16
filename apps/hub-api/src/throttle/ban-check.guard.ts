import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AbuseDetectionService } from './abuse-detection.service';

@Injectable()
export class BanCheckGuard implements CanActivate {
  constructor(private readonly abuse: AbuseDetectionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const ip: string = req.ip ?? req.socket?.remoteAddress ?? req.headers?.['x-forwarded-for'] ?? 'unknown';

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
