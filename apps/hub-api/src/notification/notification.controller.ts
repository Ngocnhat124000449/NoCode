import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { NotificationService } from './notification.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthedRequest extends Request {
  user: { id: string };
}

@ApiTags('devices')
@ApiBearerAuth()
@Controller('devices')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register or refresh FCM token for the current user' })
  @ApiResponse({ status: 200, description: 'Device upserted; returns id + lastSeenAt' })
  async register(@Req() req: AuthedRequest, @Body() dto: RegisterDeviceDto) {
    const device = await this.notifications.registerDevice(
      req.user.id,
      dto.fcmToken,
      dto.platform,
      dto.appVersion,
    );
    return { id: device.id, lastSeenAt: device.lastSeenAt };
  }

  @Delete('register')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unregister an FCM token (e.g. on logout)' })
  async unregister(@Body() dto: RegisterDeviceDto) {
    await this.notifications.unregisterDevice(dto.fcmToken);
  }
}
