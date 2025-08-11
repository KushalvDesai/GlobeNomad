import { InputType, Field, Int, Float, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class UpdateStopInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedDuration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  type?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateItineraryItemInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  day?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @Field(() => UpdateStopInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateStopInput)
  stop?: UpdateStopInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateItineraryInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field(() => [UpdateItineraryItemInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateItineraryItemInput)
  items?: UpdateItineraryItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}