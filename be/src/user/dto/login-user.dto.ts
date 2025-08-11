import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginUserDto {
  @Field()
  email: string;

  @Field()
  password: string;
}
