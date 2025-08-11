import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../user/schema/user.schema';
import { Trip } from '../../trip/schema/trip.schema';

@ObjectType()
export class AdminDashboardStats {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  totalTrips: number;

  @Field(() => Int)
  activeUsers: number;

  @Field(() => Int)
  publicTrips: number;
}

@ObjectType()
export class AdminUsersResponse {
  @Field(() => [User])
  users: User[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}

@ObjectType()
export class AdminTripsResponse {
  @Field(() => [Trip])
  trips: Trip[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}