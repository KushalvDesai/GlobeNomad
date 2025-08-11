import { Module } from '@nestjs/common';
import { CostEstimatorService } from './cost-estimator.service';
import { CostEstimatorResolver } from './cost-estimator.resolver';
import { AiCostServiceModule } from '../ai-cost-service/ai-cost-service.module';

@Module({
  imports: [AiCostServiceModule],
  providers: [CostEstimatorService, CostEstimatorResolver],
})
export class CostEstimatorModule {}