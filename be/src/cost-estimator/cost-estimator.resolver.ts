import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CostEstimatorService } from './cost-estimator.service';
import { TripCostInput, TripCostEstimate } from './dto/estimate-trip-cost.dto';

@Resolver(() => TripCostEstimate)
export class CostEstimatorResolver {
  constructor(private readonly costEstimatorService: CostEstimatorService) {}

  @Mutation(() => TripCostEstimate)
  async estimateTripCost(
    @Args('tripCostInput') tripCostInput: TripCostInput,
  ): Promise<TripCostEstimate> {
    const result = await this.costEstimatorService.estimateTripCost(
      tripCostInput.originCity,
      tripCostInput.destinationCity,
      tripCostInput.days,
      tripCostInput.travelers,
    );

    return {
      distanceKm: result.distanceKm,
      travelCost: result.travelCost,
      hotelCost: result.hotelCost,
      mealCost: result.mealCost,
      totalCost: result.totalCost,
      originCity: tripCostInput.originCity,
      destinationCity: tripCostInput.destinationCity,
      days: tripCostInput.days,
      travelers: tripCostInput.travelers,
    };
  }
}