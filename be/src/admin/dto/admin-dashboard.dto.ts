import { ObjectType, Field, Int } from '@nestjs/graphql';

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