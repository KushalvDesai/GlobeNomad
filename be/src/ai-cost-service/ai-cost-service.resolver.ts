import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AiCostService } from './ai-cost-service.service';
import { AiCostInput, AiCostEstimate } from './dto/ai-cost-estimate.dto';

@Resolver(() => AiCostEstimate)
export class AiCostResolver {
  constructor(private readonly aiCostService: AiCostService) {}

  @Mutation(() => AiCostEstimate)
  async getAiCostEstimate(
    @Args('aiCostInput') aiCostInput: AiCostInput,
  ): Promise<AiCostEstimate> {
    return await this.aiCostService.getAiCostEstimate(
      aiCostInput.destination,
      aiCostInput.days,
      aiCostInput.travelers,
      aiCostInput.accommodationType,
      aiCostInput.mealPreference,
      aiCostInput.specificRequirements,
      aiCostInput.season,
    );
  }
}