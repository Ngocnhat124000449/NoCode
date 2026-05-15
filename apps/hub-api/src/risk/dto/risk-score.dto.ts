import { IsBoolean, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RiskScoreDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  claimsGovernment?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  claimsBank?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  demandsImmediateTransfer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  createsTimePressure?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  threatenedConsequences?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requestsSecrecy?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  advisesNoConsult?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  involvesMoneytransfer?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  involvesUnknownAccount?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  involvesCryptoOrGiftcard?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  communityReportCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  telcoFlagged?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  spoofDetected?: boolean;
}
