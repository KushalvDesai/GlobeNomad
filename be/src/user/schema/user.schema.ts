import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

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

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  @Field(() => UserRole)
  role: UserRole;
  
  @Prop({ default: true })
  @Field()
  isActive: boolean;
  
  @Prop({ nullable: true })
  @Field({ nullable: true })
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
