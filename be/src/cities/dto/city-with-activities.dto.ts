import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Activity } from '../../activities/schema/activity.schema';

@ObjectType()
export class CityWithActivities {
  @Field()
  cityName: string;

  @Field()
  country: string;

  @Field({ nullable: true })
  state?: string;

  @Field(() => [Activity])
  activities: Activity[];

  @Field(() => Int)
  totalActivities: number;

  @Field(() => [String])
  availableCategories: string[];

  @Field({ nullable: true })
  averagePrice?: number;

  @Field({ nullable: true })
  averageRating?: number;
}