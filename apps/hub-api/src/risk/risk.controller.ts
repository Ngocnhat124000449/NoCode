import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { RiskService } from './risk.service';
import { RiskTokenService } from './risk-token.service';
import { RiskScoreDto } from './dto/risk-score.dto';
import { BanCheckGuard } from '../throttle/ban-check.guard';

class VerifyTokenDto {
  @IsString()
  token: string;
}

@ApiTags('risk')
@Controller('risk')
export class RiskController {
  constructor(
    private readonly riskService: RiskService,
    private readonly riskTokenService: RiskTokenService,
  ) {}

  @Post('score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Score risk signals (stateless)' })
  @ApiResponse({ status: 200, description: 'Risk score with reason codes' })
  async score(@Body() dto: RiskScoreDto) {
    return this.riskService.score(dto);
  }

  @Post('score-by-phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Score enriched with community report count for a phone' })
  @ApiQuery({ name: 'phone', description: 'Raw Vietnamese phone number' })
  async scoreByPhone(@Query('phone') phone: string, @Body() dto: RiskScoreDto) {
    return this.riskService.scoreByPhone(phone, dto);
  }

  @Post('token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate short-lived risk token from signals' })
  @ApiResponse({ status: 200, description: 'Signed JWT risk token' })
  async generateToken(@Body() dto: RiskScoreDto) {
    const result = await this.riskService.score(dto);
    return this.riskTokenService.generate(result);
  }

  @Post('token/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify and decode a risk token' })
  @ApiResponse({ status: 200, description: 'Decoded token payload' })
  @ApiResponse({ status: 401, description: 'Expired or tampered token' })
  async verifyToken(@Body() body: VerifyTokenDto) {
    return this.riskTokenService.verify(body.token);
  }

  @Get('lookup')
  @UseGuards(BanCheckGuard, ThrottlerGuard)
  @Throttle({ lookup: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Look up stored risk score by raw phone number' })
  @ApiQuery({ name: 'phone', description: 'Raw Vietnamese phone number' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async lookup(@Query('phone') phone: string) {
    return this.riskService.lookupByPhone(phone);
  }
}
