import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @MinLength(20, { message: 'FCM token looks too short' })
  fcmToken!: string;

  @IsOptional()
  @IsIn(['android', 'ios'])
  platform?: 'android' | 'ios';

  @IsOptional()
  @IsString()
  appVersion?: string;
}
