import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schema/user.schema';

@Injectable()
export class TokenCleanupService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredTokens() {
    const now = new Date();
    await this.userModel.updateMany(
      {
        passwordResetExpires: { $lt: now },
      },
      {
        $unset: {
          passwordResetToken: 1,
          passwordResetExpires: 1,
        },
      },
    );
    console.log('Cleaned up expired password reset tokens');
  }
}