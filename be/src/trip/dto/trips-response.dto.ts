import { ObjectType, Field } from '@nestjs/graphql';
import { Trip } from '../schema/trip.schema';

@ObjectType()
export class TripsResponse {
  @Field(() => [Trip])
  trips: Trip[];

  @Field()
  total: number;

  @Field()
  hasMore: boolean;
}