import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) public userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    // Retrieves all users from the database
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User | null> {
    // Finds a user by their unique ID
    return this.userModel.findById(id).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Creates a new user with hashed password and timestamps
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return createdUser.save();
  }

  async update(id: string, updateData: Partial<User>): Promise<User | null> {
    // Updates user data by ID with validation and timestamps
    if (!id || typeof id !== 'string') {
        throw new Error('Invalid ID provided');
    }
    if (!updateData || Object.keys(updateData).length === 0) {
        throw new Error('No update data provided');
    }

    return this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true },
      )
      .populate('_id')
      .exec();
  }

  async delete(id: string): Promise<User | null> {
    // Deletes a user by their unique ID
    return this.userModel.findByIdAndDelete(id).exec();
  }

}
