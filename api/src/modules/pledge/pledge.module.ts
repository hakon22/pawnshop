import { Module } from '@nestjs/common';

import { CatalogModule } from '@api/modules/catalog/catalog.module';
import { PledgeController } from '@api/modules/pledge/controllers/pledge.controller';
import { PledgeQueryService } from '@api/modules/pledge/services/pledge-query.service';
import { PledgeService } from '@api/modules/pledge/services/pledge.service';
import { RedemptionCalculatorService } from '@api/modules/pledge/services/redemption-calculator.service';

@Module({
  imports: [CatalogModule],
  controllers: [PledgeController],
  providers: [PledgeService, PledgeQueryService, RedemptionCalculatorService],
  exports: [PledgeService, RedemptionCalculatorService],
})
export class PledgeModule {}
