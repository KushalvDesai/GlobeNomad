import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schema/trip.schema';
import { CreateTripInput } from './dto/create-trip.input';
import { UpdateTripInput } from './dto/update-trip.input';
import { TripsResponse } from './dto/trips-response.dto';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {}

  async create(createTripInput: CreateTripInput, userId: string): Promise<Trip> {
    const trip = new this.tripModel({
      ...createTripInput,
      owner: userId,
      startDate: createTripInput.startDate ? new Date(createTripInput.startDate) : undefined,
      endDate: createTripInput.endDate ? new Date(createTripInput.endDate) : undefined,
    });

    const savedTrip = await trip.save();
    const populatedTrip = await this.tripModel.findById(savedTrip._id).populate('owner').exec();
    if (!populatedTrip) {
      throw new NotFoundException('Trip not found after creation');
    }
    return populatedTrip;
  }

  async findMyTrips(userId: string, limit = 10, offset = 0): Promise<TripsResponse> {
    const trips = await this.tripModel
      .find({ owner: userId })
      .populate('owner')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .skip(offset)
      .exec();

    const hasMore = trips.length > limit;
    if (hasMore) trips.pop();

    const total = await this.tripModel.countDocuments({ owner: userId });

    return {
      trips,
      total,
      hasMore,
    };
  }

  async findOne(id: string, userId?: string): Promise<Trip> {
    const trip = await this.tripModel.findById(id).populate('owner').exec();
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Check if user can access this trip
    if (!trip.isPublic && (!userId || (trip.owner as any)._id.toString() !== userId)) {
      throw new ForbiddenException('Access denied');
    }

    return trip;
  }

  async findBySlug(slug: string): Promise<Trip> {
    const trip = await this.tripModel
      .findOne({ slug, isPublic: true })
      .populate('owner')
      .exec();
    
    if (!trip) {
      throw new NotFoundException('Public trip not found');
    }

    return trip;
  }

  async update(updateTripInput: UpdateTripInput, userId: string): Promise<Trip> {
    const trip = await this.tripModel.findById(updateTripInput.id);
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only update your own trips');
    }

    const updateData: any = {
      ...updateTripInput,
      startDate: updateTripInput.startDate ? new Date(updateTripInput.startDate) : undefined,
      endDate: updateTripInput.endDate ? new Date(updateTripInput.endDate) : undefined,
    };

    delete updateData.id;

    const updatedTrip = await this.tripModel
      .findByIdAndUpdate(updateTripInput.id, updateData, { new: true })
      .populate('owner')
      .exec();

    if (!updatedTrip) {
      throw new NotFoundException('Trip not found after update');
    }

    return updatedTrip;
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const trip = await this.tripModel.findById(id);
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own trips');
    }

    await this.tripModel.findByIdAndDelete(id);
    return true;
  }

  async togglePublic(tripId: string, isPublic: boolean, userId: string): Promise<{ slug?: string }> {
    const trip = await this.tripModel.findById(tripId);
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only modify your own trips');
    }

    let slug: string | undefined;

    if (isPublic) {
      // Generate unique slug
      slug = await this.generateUniqueSlug(trip.title);
    } else {
      // Remove slug when making private
      slug = undefined;
    }

    await this.tripModel.findByIdAndUpdate(tripId, {
      isPublic,
      slug,
    });

    return { slug };
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50); // Limit slug length
    
    let slug = baseSlug;
    let counter = 1;

    while (await this.tripModel.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async updateBudgetEstimate(tripId: string, estimatedBudget: number, userId: string): Promise<Trip> {
    const trip = await this.tripModel.findById(tripId);
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only update your own trips');
    }

    const updatedTrip = await this.tripModel
      .findByIdAndUpdate(tripId, { estimatedBudget }, { new: true })
      .populate('owner')
      .exec();

    if (!updatedTrip) {
      throw new NotFoundException('Trip not found after budget update');
    }

    return updatedTrip;
  }
}