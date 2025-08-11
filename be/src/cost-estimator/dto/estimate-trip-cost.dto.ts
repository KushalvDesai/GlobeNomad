import { Field, InputType, ObjectType, Int, Float } from '@nestjs/graphql';

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
}