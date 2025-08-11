import { Module } from '@nestjs/common';
import { AiCostService } from './ai-cost-service.service';
import { AiCostResolver } from './ai-cost-service.resolver';
import { AiCostOnlyService } from './ai-cost-only.service';
import { AiCostOnlyResolver } from './ai-cost-only.resolver';
import { BriefCostService } from './brief-cost.service';
import { BriefCostResolver } from './brief-cost.resolver';

@Module({
  providers: [
    AiCostService, 
    AiCostResolver, 
    AiCostOnlyService, 
    AiCostOnlyResolver,
    BriefCostService,
    BriefCostResolver
  ],
  exports: [AiCostService, AiCostOnlyService, BriefCostService],
})
export class AiCostServiceModule {}