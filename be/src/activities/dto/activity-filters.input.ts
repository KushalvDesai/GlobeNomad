import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsNumber, IsArray, Min, Max } from 'class-validator';

@InputType()
export class ActivityFiltersInput {
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
  @IsString()
  category?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDuration?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  fitnessLevel?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  skillLevel?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  seasons?: string[];

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string; // price, rating, duration, name

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortOrder?: string; // asc, desc
}