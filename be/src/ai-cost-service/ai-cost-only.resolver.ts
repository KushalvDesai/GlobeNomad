import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { AiCostOnlyService, CostOnlyResult } from './ai-cost-only.service';
import { AccommodationType, MealPreference } from './dto/ai-cost-estimate.dto';
import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class CostOnlyResponse {
  @Field(() => Float, { description: 'Hotel cost per night in INR' })
  hotelCostPerNight: number;

  @Field(() => Float, { description: 'Total hotel cost in INR' })
  totalHotelCost: number;

  @Field(() => Float, { description: 'Meal cost per person per day in INR' })
  mealCostPerPersonPerDay: number;

  @Field(() => Float, { description: 'Total meal cost in INR' })
  totalMealCost: number;

  @Field(() => Float, { description: 'Total cost (hotel + meals) in INR' })
  totalCost: number;

  @Field()
  destination: string;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  travelers: number;
}

@Resolver(() => CostOnlyResponse)
export class AiCostOnlyResolver {
  constructor(private readonly aiCostOnlyService: AiCostOnlyService) {}

  @Query(() => CostOnlyResponse, { description: 'Get AI-powered cost estimates in Indian Rupees (INR)' })
  async getAiCostOnly(
    @Args('destination') destination: string,
    @Args('days', { type: () => Int }) days: number,
    @Args('travelers', { type: () => Int }) travelers: number,
    @Args('accommodationType', { type: () => AccommodationType, nullable: true, defaultValue: AccommodationType.MID_RANGE })
    accommodationType?: AccommodationType,
    @Args('mealPreference', { type: () => MealPreference, nullable: true, defaultValue: MealPreference.CASUAL_DINING })
    mealPreference?: MealPreference,
  ): Promise<CostOnlyResponse> {
    return await this.aiCostOnlyService.getHotelAndMealCosts(
      destination,
      days,
      travelers,
      accommodationType,
      mealPreference,
    );
  }
}