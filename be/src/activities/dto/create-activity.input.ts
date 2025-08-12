import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsNumber, IsString, IsArray, IsBoolean, Min, Max } from 'class-validator';

@InputType()
export class ActivityLocationInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  city: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  country: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

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
}

@InputType()
export class ActivityPricingInput {
  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @Field({ defaultValue: 'USD' })
  @IsOptional()
  @IsString()
  currency: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  groupDiscount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  seasonalMultiplier?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  priceIncludes?: string;
}

@InputType()
export class ActivityRequirementsInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minAge?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxAge?: number;

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
  equipment?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  restrictions?: string[];
}

@InputType()
export class CreateActivityInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  description: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @Field(() => ActivityLocationInput)
  @IsNotEmpty()
  location: ActivityLocationInput;

  @Field(() => ActivityPricingInput)
  @IsNotEmpty()
  pricing: ActivityPricingInput;

  @Field(() => ActivityRequirementsInput, { nullable: true })
  @IsOptional()
  requirements?: ActivityRequirementsInput;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  duration?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxParticipants?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  images?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  tags?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  bestSeasons?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  operatingHours?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactInfo?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bookingUrl?: string;
}