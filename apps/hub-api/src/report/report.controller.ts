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
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { BanCheckGuard } from '../throttle/ban-check.guard';

@ApiTags('report')
@UseGuards(BanCheckGuard, ThrottlerGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @Throttle({ report: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit a scam call report' })
  @ApiResponse({ status: 202, description: 'Report accepted for async processing' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async create(@Body() dto: CreateReportDto) {
    return this.reportService.create(dto);
  }

  @Get('count')
  @Throttle({ lookup: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get report count for a phone number' })
  @ApiQuery({ name: 'phone', description: 'Raw Vietnamese phone number (any format)' })
  async getCount(@Query('phone') phone: string) {
    return this.reportService.getReportCountByPhone(phone);
  }
}
