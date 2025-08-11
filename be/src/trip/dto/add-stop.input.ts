import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNumber, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateStopInput } from './create-itinerary.input';

@InputType()
export class AddStopToTripInput {
  @Field()
  @IsString()
  tripId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  day: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  order: number;

  @Field(() => CreateStopInput)
  @ValidateNested()
  @Type(() => CreateStopInput)
  stop: CreateStopInput;
}