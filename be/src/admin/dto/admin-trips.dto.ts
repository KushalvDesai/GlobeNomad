import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Trip } from '../../trip/schema/trip.schema';

@ObjectType()
export class AdminTripsResponse {
  @Field(() => [Trip])
  trips: Trip[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;
}

@ObjectType()
export class TripStatsResponse {
  @Field(() => Int)
  totalTrips: number;

  @Field(() => Int)
  publicTrips: number;

  @Field(() => Int)
  privateTrips: number;

  @Field(() => Int)
  tripsWithBudget: number;

  @Field(() => Int)
  tripsThisMonth: number;
}

@ObjectType()
export class TripModerationResponse {
  @Field(() => [Trip])
  flaggedTrips: Trip[];

  @Field(() => [Trip])
  recentTrips: Trip[];

  @Field(() => Int)
  pendingReviews: number;
}