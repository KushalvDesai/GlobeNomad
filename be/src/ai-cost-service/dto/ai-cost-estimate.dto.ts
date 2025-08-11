import { Field, InputType, ObjectType, Int, Float, registerEnumType } from '@nestjs/graphql';

// Define accommodation types
export enum AccommodationType {
  BUDGET = 'budget',
  MID_RANGE = 'mid_range',
  LUXURY = 'luxury',
  HOSTEL = 'hostel',
  BOUTIQUE = 'boutique'
}

// Define meal preferences
export enum MealPreference {
  LOCAL_STREET_FOOD = 'local_street_food',
  CASUAL_DINING = 'casual_dining',
  FINE_DINING = 'fine_dining',
  FAST_FOOD = 'fast_food',
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan'
}

// Register enums for GraphQL
registerEnumType(AccommodationType, {
  name: 'AccommodationType',
  description: 'Types of accommodation preferences',
});

registerEnumType(MealPreference, {
  name: 'MealPreference',
  description: 'Meal preference types',
});

@InputType()
export class AiCostInput {
  @Field()
  destination: string;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  travelers: number;

  @Field(() => AccommodationType, { defaultValue: AccommodationType.MID_RANGE })
  accommodationType: AccommodationType;

  @Field(() => MealPreference, { defaultValue: MealPreference.CASUAL_DINING })
  mealPreference: MealPreference;

  @Field({ nullable: true })
  specificRequirements?: string;

  @Field({ nullable: true })
  season?: string; // e.g., "summer", "winter", "peak", "off-peak"
}

@ObjectType()
export class AiCostEstimate {
  @Field()
  destination: string;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  travelers: number;

  @Field(() => Float, { description: 'Hotel cost per night in INR' })
  hotelCostPerNight: number;

  @Field(() => Float, { description: 'Total hotel cost for entire stay in INR' })
  totalHotelCost: number;

  @Field(() => Float, { description: 'Meal cost per person per day in INR' })
  mealCostPerPersonPerDay: number;

  @Field(() => Float, { description: 'Total meal cost for all travelers and days in INR' })
  totalMealCost: number;

  @Field(() => Float, { description: 'Total accommodation and meal cost in INR' })
  totalAccommodationAndMealCost: number;

  @Field()
  accommodationType: string;

  @Field()
  mealPreference: string;

  @Field({ description: 'AI-generated recommendations and suggestions' })
  aiRecommendations: string;

  @Field({ description: 'Detailed cost breakdown in INR' })
  costBreakdown: string;

  @Field({ description: 'Local insights and travel tips' })
  localInsights: string;

  @Field({ description: 'Currency code (INR)' })
  currency: string;
}