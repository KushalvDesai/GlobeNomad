import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schema/user.schema';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async syncUserFromClerk(clerkUserId: string): Promise<User> {
    // Check if user already exists in our database
    let user = await this.userModel.findOne({ clerkId: clerkUserId });

    if (!user) {
      // Get user data from Clerk
      const clerkUser = await clerkClient.users.getUser(clerkUserId);

      // Create new user in our database
      user = new this.userModel({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        createdAt: new Date(clerkUser.createdAt),
        updatedAt: new Date(),
      });

      await user.save();
    }

    return user;
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    return this.userModel.findOne({ clerkId });
  }

  async updateUser(
    clerkId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { clerkId },
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );
  }
}
