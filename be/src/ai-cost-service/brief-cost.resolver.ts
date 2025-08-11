import { Resolver, Query, Args } from '@nestjs/graphql';
import { BriefCostService } from './brief-cost.service';
import { BriefCostInput, BriefCostEstimate, StayType, MealType } from './dto/brief-cost-estimate.dto';

@Resolver(() => BriefCostEstimate)
export class BriefCostResolver {
  constructor(private readonly briefCostService: BriefCostService) {}

  @Query(() => BriefCostEstimate, { description: 'Get AI-driven cost estimation for hotel and meals' })
  async getAiCostEstimate(
    @Args('briefCostInput') briefCostInput: BriefCostInput,
  ): Promise<BriefCostEstimate> {
    if (briefCostInput.additionalContext) {
      return await this.briefCostService.getAiDrivenCostWithContext(
        briefCostInput.destination,
        briefCostInput.stayType,
        briefCostInput.mealType,
        briefCostInput.additionalContext,
      );
    }
    
    return await this.briefCostService.getBriefCostEstimate(
      briefCostInput.destination,
      briefCostInput.stayType,
      briefCostInput.mealType,
    );
  }

  @Query(() => BriefCostEstimate, { description: 'Get quick AI-powered cost estimate' })
  async getQuickAiCostEstimate(
    @Args('destination') destination: string,
    @Args('stayType', { type: () => StayType, defaultValue: StayType.COMFORT_STAY }) stayType: StayType,
    @Args('mealType', { type: () => MealType, defaultValue: MealType.CASUAL_DINING }) mealType: MealType,
  ): Promise<BriefCostEstimate> {
    return await this.briefCostService.getBriefCostEstimate(destination, stayType, mealType);
  }
}