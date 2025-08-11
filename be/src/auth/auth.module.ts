import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User, UserSchema } from '../user/schema/user.schema';
import { EmailService } from './email.service';
import { TokenCleanupService } from './token-cleanup.service';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ScheduleModule.forRoot(),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    JwtAuthGuard,
    EmailService,
    TokenCleanupService,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}