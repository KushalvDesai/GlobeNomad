import { Module } from '@nestjs/common';
import { ClerkAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [ClerkAuthGuard, AuthService],
  exports: [ClerkAuthGuard, AuthService],
})
export class AuthModule {}
