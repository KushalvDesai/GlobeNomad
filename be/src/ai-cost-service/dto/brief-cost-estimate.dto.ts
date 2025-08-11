import { Field, InputType, ObjectType, Int, Float, registerEnumType } from '@nestjs/graphql';

// Define stay types
export enum StayType {
  BUDGET_FRIENDLY = 'budget_friendly',
  COMFORT_STAY = 'comfort_stay',
  LUXURY = 'luxury'
}

// Define meal types
export enum MealType {
  BUDGET_FRIENDLY = 'budget_friendly',
  CASUAL_DINING = 'casual_dining',
  FINE_DINING = 'fine_dining'
}

// Register enums for GraphQL
registerEnumType(StayType, {
  name: 'StayType',
  description: 'Types of stay preferences',
});

registerEnumType(MealType, {
  name: 'MealType',
  description: 'Types of meal preferences',
});

@InputType()
export class BriefCostInput {
  @Field()
  destination: string;

  @Field(() => StayType, { defaultValue: StayType.COMFORT_STAY })
  stayType: StayType;

  @Field(() => MealType, { defaultValue: MealType.CASUAL_DINING })
  mealType: MealType;

  @Field({ nullable: true, description: 'Additional context for AI analysis' })
  additionalContext?: string;
}

@ObjectType()
export class BriefCostEstimate {
  @Field()
  destination: string;

  @Field(() => Float, { description: 'AI-estimated hotel cost per night in INR' })
  hotelCostPerNight: number;

  @Field(() => Float, { description: 'AI-estimated meal cost per person per day in INR' })
  mealCostPerPersonPerDay: number;

  @Field()
  stayType: string;

  @Field()
  mealType: string;

  @Field({ description: 'AI-generated brief summary with local insights' })
  briefSummary: string;

  @Field({ nullable: true, description: 'AI confidence level in the estimate' })
  aiConfidence?: string;
}