import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ActivityDocument = Activity & Document;
export type ActivityCategoryDocument = ActivityCategory & Document;

@Schema({ timestamps: true })
@ObjectType()
export class ActivityCategory {
  @Field(() => ID)
  id: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  description?: string;

  @Prop()
  @Field({ nullable: true })
  createdAt?: Date;

  @Prop()
  @Field({ nullable: true })
  updatedAt?: Date;
}

export const ActivityCategorySchema = SchemaFactory.createForClass(ActivityCategory);

@Schema()
@ObjectType()
export class ActivityLocation {
  @Prop({ required: true })
  @Field()
  city: string;

  @Prop({ required: true })
  @Field()
  country: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  state?: string;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  address?: string;
}

@Schema()
@ObjectType()
export class ActivityPricing {
  @Prop({ required: true })
  @Field(() => Float)
  basePrice: number;

  @Prop({ required: true, default: 'USD' })
  @Field()
  currency: string;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  groupDiscount?: number;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  seasonalMultiplier?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  priceIncludes?: string;
}

@Schema()
@ObjectType()
export class ActivityRequirements {
  @Prop({ required: false })
  @Field(() => Int, { nullable: true })
  minAge?: number;

  @Prop({ required: false })
  @Field(() => Int, { nullable: true })
  maxAge?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  fitnessLevel?: string; // beginner, intermediate, advanced

  @Prop({ required: false })
  @Field({ nullable: true })
  skillLevel?: string; // none, basic, intermediate, expert

  @Prop({ required: false })
  @Field(() => [String], { nullable: true })
  equipment?: string[];

  @Prop({ required: false })
  @Field(() => [String], { nullable: true })
  restrictions?: string[];
}

@Schema({ timestamps: true })
@ObjectType()
export class Activity {
  @Field(() => ID)
  id: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: true })
  @Field()
  description: string;

  @Prop({ type: ActivityCategorySchema, required: true })
  @Field(() => ActivityCategory)
  category: ActivityCategory;

  @Prop({ type: ActivityLocation, required: true })
  @Field(() => ActivityLocation)
  location: ActivityLocation;

  @Prop({ type: ActivityPricing, required: true })
  @Field(() => ActivityPricing)
  pricing: ActivityPricing;

  @Prop({ type: ActivityRequirements, required: false })
  @Field(() => ActivityRequirements, { nullable: true })
  requirements?: ActivityRequirements;

  @Prop({ required: false })
  @Field(() => Int, { nullable: true })
  duration?: number; // in minutes

  @Prop({ required: false })
  @Field(() => Int, { nullable: true })
  maxParticipants?: number;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  rating?: number;

  @Prop({ required: false })
  @Field(() => Int, { nullable: true })
  reviewCount?: number;

  @Prop({ required: false })
  @Field(() => [String], { nullable: true })
  images?: string[];

  @Prop({ required: false })
  @Field(() => [String], { nullable: true })
  tags?: string[];

  @Prop({ required: false })
  @Field(() => [String], { nullable: true })
  bestSeasons?: string[];

  @Prop({ required: false })
  @Field(() => [String], { nullable: true })
  operatingHours?: string[];

  @Prop({ required: false })
  @Field({ nullable: true })
  contactInfo?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  bookingUrl?: string;

  @Prop({ default: true })
  @Field()
  isActive: boolean;

  @Prop()
  @Field({ nullable: true })
  createdAt?: Date;

  @Prop()
  @Field({ nullable: true })
  updatedAt?: Date;
}

@ObjectType()
export class CityActivityStats {
  @Field()
  city: string;

  @Field()
  country: string;

  @Field(() => Int)
  totalActivities: number;

  @Field(() => [String])
  categories: string[];

  @Field(() => Float, { nullable: true })
  averagePrice?: number;

  @Field(() => Float, { nullable: true })
  averageRating?: number;

  @Field(() => String)
  currency: string;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);

// Indexes for better performance
ActivitySchema.index({ 'location.city': 1, 'category.name': 1 });
ActivitySchema.index({ 'location.country': 1 });
ActivitySchema.index({ 'category.name': 1 });
ActivitySchema.index({ tags: 1 });
ActivitySchema.index({ rating: -1 });
ActivitySchema.index({ 'pricing.basePrice': 1 });