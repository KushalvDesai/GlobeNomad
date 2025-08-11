import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class ReorderItemInput {
  @Field(() => ID)
  @IsString()
  itemId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  day: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  order: number;
}

@InputType()
export class ReorderItineraryInput {
  @Field(() => ID)
  @IsString()
  itineraryId: string;

  @Field(() => [ReorderItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemInput)
  items: ReorderItemInput[];
}