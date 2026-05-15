import { IsString, IsEnum, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScenarioType {
  IMPERSONATION = 'impersonation',
  INVESTMENT_FRAUD = 'investment_fraud',
  ROMANCE_SCAM = 'romance_scam',
  LOTTERY_SCAM = 'lottery_scam',
  TECH_SUPPORT = 'tech_support',
  OTHER = 'other',
}

export class CreateReportDto {
  @ApiProperty({ description: 'Raw Vietnamese phone number (any format)' })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiProperty({ enum: ScenarioType, description: 'Type of scam scenario' })
  @IsEnum(ScenarioType)
  scenarioType: ScenarioType;

  @ApiPropertyOptional({ description: 'ISO timestamp of the call' })
  @IsOptional()
  @IsDateString()
  reportedAt?: string;
}
