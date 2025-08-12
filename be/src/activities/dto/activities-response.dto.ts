import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Activity } from '../schema/activity.schema';

@ObjectType()
export class ActivitiesResponse {
  @Field(() => [Activity])
  activities: Activity[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}