import { Field, ObjectType, ID, Int, Float } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Trip } from './trip.schema';

export type ItineraryDocument = Itinerary & Document;
export type ItineraryItemDocument = ItineraryItem & Document;
export type StopDocument = Stop & Document;

@Schema()
@ObjectType()
export class Stop {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  description?: string;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Prop({ required: false })
  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  address?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  city?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  country?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  estimatedDuration?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  estimatedCost?: number;

  @Prop({ required: false, default: 'destination' })
  @Field({ nullable: true, defaultValue: 'destination' })
  type?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  notes?: string;
}

// Create StopSchema first
export const StopSchema = SchemaFactory.createForClass(Stop);

@Schema()
@ObjectType()
export class ItineraryItem {
  @Field(() => ID)
  id: string;

  @Prop({ required: true })
  @Field(() => Int)
  day: number;

  @Prop({ required: true })
  @Field(() => Int)
  order: number;

  @Prop({ type: StopSchema, required: true })
  @Field(() => Stop)
  stop: Stop;

  @Prop({ required: false })
  @Field({ nullable: true })
  startTime?: Date;

  @Prop({ required: false })
  @Field({ nullable: true })
  endTime?: Date;

  @Prop({ required: false })
  @Field({ nullable: true })
  notes?: string;

  @Prop({ default: Date.now })
  @Field()
  createdAt: Date;

  @Prop({ default: Date.now })
  @Field()
  updatedAt: Date;
}

@Schema({ timestamps: true })
@ObjectType()
export class Itinerary {
  @Field(() => ID)
  id: string;

  @Prop({ type: Types.ObjectId, ref: 'Trip', required: true })
  @Field(() => Trip)
  trip: Trip;

  @Prop({ type: [ItineraryItem], default: [] })
  @Field(() => [ItineraryItem])
  items: ItineraryItem[];

  @Prop({ required: false })
  @Field({ nullable: true })
  notes?: string;

  @Prop()
  @Field()
  createdAt: Date;

  @Prop()
  @Field()
  updatedAt: Date;
}

export const ItineraryItemSchema = SchemaFactory.createForClass(ItineraryItem);
export const ItinerarySchema = SchemaFactory.createForClass(Itinerary);

// Indexes for better performance
ItinerarySchema.index({ trip: 1 });
ItineraryItemSchema.index({ day: 1, order: 1 });