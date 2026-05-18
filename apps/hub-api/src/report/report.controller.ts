import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Param,
  Req,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { BanCheckGuard } from '../throttle/ban-check.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthedRequest extends Request {
  user: { id: string };
}

@ApiTags('report')
@UseGuards(BanCheckGuard, ThrottlerGuard)
@Controller()
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // --- Public-ish report API (uses optional JWT to capture reporterId) ---

  @Post('report')
  @Throttle({ report: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit a scam call report' })
  @ApiResponse({ status: 202, description: 'Report accepted for async processing' })
  @ApiResponse({ status: 429, description: 'Rate limit exceeded' })
  async create(@Body() dto: CreateReportDto, @Req() req: Request) {
    // reporterId comes from JWT if present. Anonymous reports stay supported
    // (mobile may submit a report before the user is authenticated).
    const reporterId = (req as Partial<AuthedRequest>).user?.id;
    return this.reportService.create(dto, reporterId);
  }

  @Get('report/count')
  @Throttle({ lookup: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Get report count for a phone number' })
  @ApiQuery({ name: 'phone', description: 'Raw Vietnamese phone number (any format)' })
  async getCount(@Query('phone') phone: string) {
    return this.reportService.getReportCountByPhone(phone);
  }

  // --- Per-user endpoints (JWT required) ---

  @Get('me/reports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List the current user's submitted reports" })
  async listMyReports(@Req() req: AuthedRequest) {
    const items = await this.reportService.findByReporter(req.user.id);
    return { items, total: items.length };
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Counters used by the home screen for the current user" })
  async myStats(@Req() req: AuthedRequest) {
    return this.reportService.getStatsForUser(req.user.id);
  }

  @Get('reports/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Single report (owner only)' })
  @ApiResponse({ status: 404, description: 'Report not found or not owned by caller' })
  async getReportById(@Param('id') id: string, @Req() req: AuthedRequest) {
    const report = await this.reportService.findOneOwned(id, req.user.id);
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }
}
