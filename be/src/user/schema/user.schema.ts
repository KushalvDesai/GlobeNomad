import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field()
  id: string;

  @Prop({ required: true, unique: true })
  @Field()
  clerkId: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: true, unique: true })
  @Field()
  email: string;

  @Prop()
  @Field({ nullable: true })
  firstName?: string;

  @Prop()
  @Field({ nullable: true })
  lastName?: string;

  @Prop()
  @Field({ nullable: true })
  imageUrl?: string;

  @Prop()
  @Field({ nullable: true })
  rollNo?: string;

  @Prop()
  @Field()
  createdAt: Date;

  @Prop()
  @Field()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
