import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
@ObjectType()
export class User {
  @Field()
  id: string;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: true, unique: true })
  @Field()
  email: string;

  @Prop({ required: true })
  @Field()
  firstName: string;

  @Prop({ required: true })
  @Field()
  lastName: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  password?: string;

  @Prop()
  @Field({ nullable: true })
  passwordResetToken?: string;

  @Prop()
  @Field({ nullable: true })
  passwordResetExpires?: Date;

  @Prop()
  @Field()
  updatedAt: Date;

  @Prop({ required: false })
  @Field({ nullable: true })
  phoneNumber?: string;

  @Prop({ required: true })
  @Field()
  city: string;

  @Prop({ required: true })
  @Field()
  country: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
