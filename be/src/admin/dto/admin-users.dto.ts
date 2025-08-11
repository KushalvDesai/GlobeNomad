import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../user/schema/user.schema';

@ObjectType()
export class AdminUsersResponse {
  @Field(() => [User])
  users: User[];

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
export class UserStatsResponse {
  @Field(() => Int)
  totalUsers: number;

  @Field(() => Int)
  activeUsers: number;

  @Field(() => Int)
  inactiveUsers: number;

  @Field(() => Int)
  adminUsers: number;

  @Field(() => Int)
  regularUsers: number;
}