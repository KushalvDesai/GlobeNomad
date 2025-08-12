import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from './schema/trip.schema';
import { Itinerary, ItineraryDocument, ItineraryItem } from './schema/itinerary.schema';
import { CreateTripInput } from './dto/create-trip.input';
import { UpdateTripInput } from './dto/update-trip.input';
import { CreateItineraryInput } from './dto/create-itinerary.input';
import { UpdateItineraryInput } from './dto/update-itinerary.input';
import { ReorderItineraryInput } from './dto/reorder-itinerary.input';
import { AddStopToTripInput } from './dto/add-stop.input';
import { TripsResponse } from './dto/trips-response.dto';
import { CostEstimatorService } from '../cost-estimator/cost-estimator.service';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    @InjectModel(Itinerary.name) private itineraryModel: Model<ItineraryDocument>,
    private costEstimatorService: CostEstimatorService,
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

  async findAllPublicTrips(limit = 10, offset = 0): Promise<TripsResponse> {
    const trips = await this.tripModel
      .find({ isPublic: true })
      .populate('owner')
      // .populate('itinerary')
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .skip(offset)
      .exec();

    const hasMore = trips.length > limit;
    if (hasMore) trips.pop();

    const total = await this.tripModel.countDocuments({ isPublic: true });

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

  // Itinerary Management Methods
  async createItinerary(createItineraryInput: CreateItineraryInput, userId: string): Promise<Itinerary> {
    // Verify trip ownership
    const trip = await this.tripModel.findById(createItineraryInput.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only create itineraries for your own trips');
    }

    // Check if itinerary already exists for this trip
    const existingItinerary = await this.itineraryModel.findOne({ trip: createItineraryInput.tripId });
    if (existingItinerary) {
      throw new ForbiddenException('Itinerary already exists for this trip');
    }

    // Process items to auto-fetch coordinates for cities
    const processedItems = await Promise.all(
      (createItineraryInput.items || []).map(async (item) => {
        let stopData = { ...item.stop };
        
        // Auto-fetch coordinates if city is provided but coordinates are missing
        if (stopData.city && (!stopData.latitude || !stopData.longitude)) {
          try {
            const coordinates = await this.costEstimatorService.getCityCoordinates(stopData.city);
            stopData.latitude = coordinates.lat;
            stopData.longitude = coordinates.lon;
            
            // Also set the city name as the stop name if name is not provided
            if (!stopData.name) {
              stopData.name = stopData.city;
            }
          } catch (error) {
            // Log the error but don't fail the request
            console.warn(`Could not fetch coordinates for city: ${stopData.city}`, error.message);
          }
        }

        return {
          ...item,
          stop: {
            ...stopData,
            id: new Date().getTime().toString() + '_stop_' + Math.random(),
          },
          id: new Date().getTime().toString() + '_item_' + Math.random(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );

    const itinerary = new this.itineraryModel({
      trip: createItineraryInput.tripId,
      items: processedItems,
      notes: createItineraryInput.notes,
    });

    const savedItinerary = await itinerary.save();
    const populatedItinerary = await this.itineraryModel.findById(savedItinerary._id).populate('trip').exec();
    
    if (!populatedItinerary) {
      throw new NotFoundException('Itinerary not found after creation');
    }
    
    return populatedItinerary;
  }

  async updateItinerary(updateItineraryInput: UpdateItineraryInput, userId: string): Promise<Itinerary> {
    const itinerary = await this.itineraryModel.findById(updateItineraryInput.id).populate('trip');
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // Verify trip ownership
    if (itinerary.trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only update itineraries for your own trips');
    }

    const updateData: any = {};
    if (updateItineraryInput.items !== undefined) {
      updateData.items = updateItineraryInput.items;
    }
    if (updateItineraryInput.notes !== undefined) {
      updateData.notes = updateItineraryInput.notes;
    }

    const updatedItinerary = await this.itineraryModel
      .findByIdAndUpdate(updateItineraryInput.id, updateData, { new: true })
      .populate('trip')
      .exec();

    if (!updatedItinerary) {
      throw new NotFoundException('Itinerary not found after update');
    }

    return updatedItinerary;
  }

  async getItinerary(tripId: string, userId?: string): Promise<Itinerary> {
    const trip = await this.tripModel.findById(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Check if user can access this trip
    if (!trip.isPublic && (!userId || trip.owner.toString() !== userId)) {
      throw new ForbiddenException('You can only access public trips or your own trips');
    }

    const itinerary = await this.itineraryModel.findOne({ trip: tripId }).populate('trip').exec();
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found for this trip');
    }

    return itinerary;
  }

  async reorderItineraryItems(reorderInput: ReorderItineraryInput, userId: string): Promise<Itinerary> {
    const itinerary = await this.itineraryModel.findById(reorderInput.itineraryId).populate('trip');
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found');
    }

    // Verify trip ownership
    if (itinerary.trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only reorder items in your own trip itineraries');
    }

    // Update the order of items
    const updatedItems = [...itinerary.items];
    reorderInput.items.forEach(reorderItem => {
      const itemIndex = updatedItems.findIndex(item => item.id === reorderItem.itemId);
      if (itemIndex !== -1) {
        updatedItems[itemIndex].day = reorderItem.day;
        updatedItems[itemIndex].order = reorderItem.order;
      }
    });

    // Sort items by day and order
    updatedItems.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.order - b.order;
    });

    const updatedItinerary = await this.itineraryModel
      .findByIdAndUpdate(reorderInput.itineraryId, { items: updatedItems }, { new: true })
      .populate('trip')
      .exec();

    if (!updatedItinerary) {
      throw new NotFoundException('Itinerary not found after reordering');
    }

    return updatedItinerary;
  }

  async addStopToTrip(addStopInput: AddStopToTripInput, userId: string): Promise<Itinerary> {
    // Verify trip ownership
    const trip = await this.tripModel.findById(addStopInput.tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only add stops to your own trips');
    }

    // Find or create itinerary
    let itinerary = await this.itineraryModel.findOne({ trip: addStopInput.tripId });
    if (!itinerary) {
      itinerary = new this.itineraryModel({
        trip: addStopInput.tripId,
        items: [],
      });
    }

    // Adjust order of existing items if necessary
    const existingItems = itinerary.items.filter(item => 
      item.day === addStopInput.day && item.order >= addStopInput.order
    );
    existingItems.forEach(item => {
      item.order += 1;
    });

    // Auto-fetch coordinates if city is provided but coordinates are missing
    let stopData = { ...addStopInput.stop };
    
    if (stopData.city && (!stopData.latitude || !stopData.longitude)) {
      try {
        const coordinates = await this.costEstimatorService.getCityCoordinates(stopData.city);
        stopData.latitude = coordinates.lat;
        stopData.longitude = coordinates.lon;
        
        // Also set the city name as the stop name if name is not provided
        if (!stopData.name) {
          stopData.name = stopData.city;
        }
      } catch (error) {
        // Log the error but don't fail the request
        console.warn(`Could not fetch coordinates for city: ${stopData.city}`, error.message);
      }
    }

    // Create new itinerary item
    const newItem: ItineraryItem = {
      id: new Date().getTime().toString(),
      day: addStopInput.day,
      order: addStopInput.order,
      stop: {
        ...stopData,
        id: new Date().getTime().toString() + '_stop',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    itinerary.items.push(newItem);

    // Sort items by day and order
    itinerary.items.sort((a, b) => {
      if (a.day !== b.day) return a.day - b.day;
      return a.order - b.order;
    });

    const savedItinerary = await itinerary.save();
    const populatedItinerary = await this.itineraryModel.findById(savedItinerary._id).populate('trip').exec();
    
    if (!populatedItinerary) {
      throw new NotFoundException('Itinerary not found after adding stop');
    }
    
    return populatedItinerary;
  }

  async removeStopFromTrip(tripId: string, itemId: string, userId: string): Promise<Itinerary> {
    // Verify trip ownership
    const trip = await this.tripModel.findById(tripId);
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }
    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('You can only remove stops from your own trips');
    }

    const itinerary = await this.itineraryModel.findOne({ trip: tripId });
    if (!itinerary) {
      throw new NotFoundException('Itinerary not found for this trip');
    }

    // Find and remove the item
    const itemIndex = itinerary.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new NotFoundException('Itinerary item not found');
    }

    const removedItem = itinerary.items[itemIndex];
    itinerary.items.splice(itemIndex, 1);

    // Adjust order of remaining items in the same day
    itinerary.items
      .filter(item => item.day === removedItem.day && item.order > removedItem.order)
      .forEach(item => {
        item.order -= 1;
      });

    const updatedItinerary = await itinerary.save();
    const populatedItinerary = await this.itineraryModel.findById(updatedItinerary._id).populate('trip').exec();
    
    if (!populatedItinerary) {
      throw new NotFoundException('Itinerary not found after removing stop');
    }
    
    return populatedItinerary;
   }
}