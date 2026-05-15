import { Module } from '@nestjs/common';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';
import { RiskTokenService } from './risk-token.service';

@Module({
  controllers: [RiskController],
  providers: [RiskService, RiskTokenService],
  exports: [RiskService, RiskTokenService],
})
export class RiskModule {}
