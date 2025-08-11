import { Field, InputType, ObjectType, Int, Float, registerEnumType } from '@nestjs/graphql';

// Define travel mode enum
export enum TravelMode {
  TRAIN = 'train',
  BUS = 'bus',
  FLIGHT = 'flight',
  AUTO = 'auto' // Auto-select based on distance
}

// Register the enum for GraphQL
registerEnumType(TravelMode, {
  name: 'TravelMode',
  description: 'Available travel modes for the trip',
});

@InputType()
export class TripCostInput {
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
}

@ObjectType()
export class TripCostEstimate {
  @Field(() => Float)
  distanceKm: number;

  @Field(() => Float)
  travelCost: number;

  @Field(() => Float)
  hotelCost: number;

  @Field(() => Float)
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
  tripType: string; // 'domestic' or 'international'
}