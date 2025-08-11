import { Field, InputType, ObjectType, Int, Float, registerEnumType } from '@nestjs/graphql';
import { TravelMode } from './estimate-trip-cost.dto';

// AI Cost Preference enum
export enum AiCostPreference {
  BUDGET_FRIENDLY = 'BUDGET_FRIENDLY',
  COMFORT_STAY = 'COMFORT_STAY', 
  LUXURY = 'LUXURY'
}

export enum AiMealPreference {
  BUDGET_FRIENDLY = 'BUDGET_FRIENDLY',
  CASUAL_DINING = 'CASUAL_DINING',
  FINE_DINING = 'FINE_DINING'
}

// Register enums for GraphQL
registerEnumType(AiCostPreference, {
  name: 'AiCostPreference',
  description: 'AI-powered accommodation preferences',
});

registerEnumType(AiMealPreference, {
  name: 'AiMealPreference', 
  description: 'AI-powered meal preferences',
});

@InputType()
export class AiEnhancedTripCostInput {
  @Field()
  originCity: string;

  @Field()
  destinationCity: string;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  travelers: number;

  @Field(() => TravelMode, { nullable: true, defaultValue: TravelMode.AUTO })
  travelMode?: TravelMode;

  @Field({ nullable: true })
  originCountry?: string;

  @Field({ nullable: true })
  destinationCountry?: string;

  // AI-powered cost preferences
  @Field(() => AiCostPreference, { defaultValue: AiCostPreference.COMFORT_STAY })
  accommodationPreference: AiCostPreference;

  @Field(() => AiMealPreference, { defaultValue: AiMealPreference.CASUAL_DINING })
  mealPreference: AiMealPreference;

  @Field({ nullable: true })
  additionalContext?: string;
}

@ObjectType()
export class AiEnhancedTripCostEstimate {
  @Field(() => Float)
  distanceKm: number;

  @Field(() => Float)
  travelCost: number;

  @Field(() => Float, { description: 'AI-powered hotel cost in INR' })
  hotelCost: number;

  @Field(() => Float, { description: 'AI-powered meal cost in INR' })
  mealCost: number;

  @Field(() => Float)
  totalCost: number;

  @Field()
  originCity: string;

  @Field()
  destinationCity: string;

  @Field(() => Int)
  days: number;

  @Field(() => Int)
  travelers: number;

  @Field(() => TravelMode)
  selectedTravelMode: TravelMode;

  @Field()
  tripType: string;

  // AI-specific fields
  @Field(() => Float, { description: 'AI-estimated hotel cost per night in INR' })
  aiHotelCostPerNight: number;

  @Field(() => Float, { description: 'AI-estimated meal cost per person per day in INR' })
  aiMealCostPerPersonPerDay: number;

  @Field(() => AiCostPreference)
  accommodationPreference: AiCostPreference;

  @Field(() => AiMealPreference)
  mealPreference: AiMealPreference;

  @Field({ description: 'AI-generated insights about the destination costs' })
  aiInsights: string;

  @Field({ description: 'Cost estimation method used' })
  costMethod: string; // 'AI_POWERED' or 'CSV_FALLBACK'
}