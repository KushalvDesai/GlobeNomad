import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { CostEstimatorService } from './cost-estimator.service';
import { TripCostInput, TripCostEstimate, TravelMode } from './dto/estimate-trip-cost.dto';

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
      tripCostInput.travelMode === TravelMode.AUTO ? 'auto' : tripCostInput.travelMode,
      tripCostInput.originCountry,
      tripCostInput.destinationCountry,
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
      selectedTravelMode: result.selectedTravelMode as TravelMode,
      tripType: result.tripType,
    };
  }

  @Mutation(() => String)
  async testAmadeusFlightPrice(
    @Args('originCity') originCity: string,
    @Args('destinationCity') destinationCity: string,
    @Args('travelers', { defaultValue: 1 }) travelers: number,
  ): Promise<string> {
    return await this.costEstimatorService.testAmadeusFlightPrice(originCity, destinationCity, travelers);
  }
}