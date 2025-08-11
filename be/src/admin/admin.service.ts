import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../user/schema/user.schema';
import { Trip, TripDocument } from '../trip/schema/trip.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {}

  // User Management
  async getAllUsers(limit = 20, offset = 0) {
    const users = await this.userModel
      .find()
      .select('-password -passwordResetToken')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
    
    const total = await this.userModel.countDocuments();
    return { users, total, hasMore: users.length === limit };
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserRole(userId: string, role: UserRole) {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Trip Management
  async getAllTrips(limit = 20, offset = 0) {
    const trips = await this.tripModel
      .find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .exec();
    
    const total = await this.tripModel.countDocuments();
    return { trips, total, hasMore: trips.length === limit };
  }

  async deleteTrip(tripId: string) {
    const trip = await this.tripModel.findByIdAndDelete(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    return true;
  }

  // Analytics
  async getDashboardStats() {
    const [totalUsers, totalTrips, activeUsers, publicTrips] = await Promise.all([
      this.userModel.countDocuments(),
      this.tripModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.tripModel.countDocuments({ isPublic: true }),
    ]);

    return {
      totalUsers,
      totalTrips,
      activeUsers,
      publicTrips,
    };
  }
}