import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schema/user.schema';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Trip {
  @Field(() => ID)
  id: string;

  @Prop({ required: true })
  @Field()
  title: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @Field(() => User)
  owner: User;

  @Prop({ required: false })
  @Field({ nullable: true })
  startDate?: Date;

  @Prop({ required: false })
  @Field({ nullable: true })
  endDate?: Date;

  @Prop({ default: false })
  @Field()
  isPublic: boolean;

  @Prop({ required: false, unique: true, sparse: true })
  @Field({ nullable: true })
  slug?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  estimatedBudget?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  actualBudget?: number;

  @Prop({ required: false })
  @Field({ nullable: true })
  currency?: string;

  @Prop()
  @Field()
  createdAt: Date;

  @Prop()
  @Field()
  updatedAt: Date;
}

export const TripSchema = SchemaFactory.createForClass(Trip);
TripSchema.index({ owner: 1, createdAt: -1 });
TripSchema.index({ isPublic: 1, createdAt: -1 });