import { Module } from '@nestjs/common';
import { CostEstimatorService } from './cost-estimator.service';
import { CostEstimatorResolver } from './cost-estimator.resolver';

@Module({
  providers: [CostEstimatorService, CostEstimatorResolver],
})
export class CostEstimatorModule {}