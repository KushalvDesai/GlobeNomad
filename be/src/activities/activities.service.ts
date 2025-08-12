import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument, ActivityCategory, ActivityCategoryDocument } from './schema/activity.schema';
import { CreateActivityInput } from './dto/create-activity.input';
import { CreateActivityCategoryInput } from './dto/create-activity-category.input';
import { ActivityFiltersInput } from './dto/activity-filters.input';

@Injectable()
export class ActivitiesService {
  private readonly logger = new Logger(ActivitiesService.name);

  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(ActivityCategory.name) private categoryModel: Model<ActivityCategoryDocument>,
  ) {
    this.initializeDefaultCategories();
    this.initializeActivities(); // Add this line
  }

  // Initialize default activity categories
  private async initializeDefaultCategories() {
    try {
      const existingCategories = await this.categoryModel.countDocuments();
      if (existingCategories === 0) {
        const defaultCategories = [
          { name: 'Trekking', description: 'Mountain and trail hiking adventures' },
          { name: 'Bungee Jumping', description: 'Extreme jumping experiences from heights' },
          { name: 'Water Activities', description: 'Swimming, surfing, and water sports' },
          { name: 'Boating', description: 'Boat tours, sailing, and marine adventures' },
          { name: 'Jungle Safari', description: 'Wildlife exploration and jungle tours' },
          { name: 'Snow Activities', description: 'Skiing, snowboarding, and winter sports' },
          { name: 'Sight Seeing', description: 'Tourist attractions and landmark visits' },
          { name: 'Paragliding', description: 'Aerial gliding and sky adventures' },
          { name: 'Sky Diving', description: 'Parachuting and freefall experiences' },
          { name: 'Scuba Diving', description: 'Underwater exploration and marine life viewing' }
        ];

        await this.categoryModel.insertMany(defaultCategories);
        this.logger.log('Default activity categories initialized');
      }
    } catch (error) {
      this.logger.error('Error initializing default categories:', error);
    }
  }

  // Add this method
  private async initializeActivities() {
    try {
      const existingActivities = await this.activityModel.countDocuments();
      if (existingActivities === 0) {
        this.logger.log('No activities found, seeding activities...');
        await this.seedActivities();
      }
    } catch (error) {
      this.logger.error('Error checking/seeding activities:', error);
    }
  }

  // Activity Category Methods
  async createCategory(createCategoryInput: CreateActivityCategoryInput): Promise<ActivityCategory> {
    const existingCategory = await this.categoryModel.findOne({ 
      name: { $regex: new RegExp(`^${createCategoryInput.name}$`, 'i') } 
    });
    
    if (existingCategory) {
      throw new BadRequestException('Category with this name already exists');
    }

    const category = new this.categoryModel(createCategoryInput);
    return category.save();
  }

  async getAllCategories(): Promise<ActivityCategory[]> {
    return this.categoryModel.find().sort({ name: 1 }).exec();
  }

  async getCategoryById(id: string): Promise<ActivityCategory> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  // Activity Methods
  async createActivity(createActivityInput: CreateActivityInput): Promise<Activity> {
    // Verify category exists
    const category = await this.getCategoryById(createActivityInput.categoryId);
    
    const activityData = {
      ...createActivityInput,
      category: category,
    };

    const activity = new this.activityModel(activityData);
    return activity.save();
  }

  async getAllActivities(filters?: ActivityFiltersInput): Promise<Activity[]> {
    try {
      const query = this.buildActivityQuery(filters);
      const sortOptions = this.buildSortOptions(filters);
      
      let queryBuilder = this.activityModel.find(query);
      
      if (sortOptions) {
        queryBuilder = queryBuilder.sort(sortOptions);
      }
      
      if (filters?.limit) {
        queryBuilder = queryBuilder.limit(filters.limit);
      }
      
      if (filters?.offset) {
        queryBuilder = queryBuilder.skip(filters.offset);
      }

      const activities = await queryBuilder.exec();
      
      // If no activities found and no filters applied, suggest seeding
      if (activities.length === 0 && !filters) {
        this.logger.warn('No activities found in database. Consider running seedActivities mutation.');
      }
      
      return activities;
    } catch (error) {
      this.logger.error('Error fetching activities:', error);
      throw error;
    }
  }

  async getActivitiesByCountry(country: string, filters?: ActivityFiltersInput): Promise<Activity[]> {
    const countryFilters = { ...filters, country: country.toLowerCase() };
    return this.getAllActivities(countryFilters);
  }

  async getActivitiesByCategory(categoryName: string, filters?: ActivityFiltersInput): Promise<Activity[]> {
    const categoryFilters = { ...filters, category: categoryName.toLowerCase() };
    return this.getAllActivities(categoryFilters);
  }

  async getActivityById(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).exec();
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return activity;
  }

  async searchActivities(searchTerm: string, filters?: ActivityFiltersInput): Promise<Activity[]> {
    const searchQuery = {
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { 'location.city': { $regex: searchTerm, $options: 'i' } },
        { 'location.country': { $regex: searchTerm, $options: 'i' } },
        { 'category.name': { $regex: searchTerm, $options: 'i' } }
      ]
    };

    const additionalFilters = this.buildActivityQuery(filters);
    const finalQuery = { ...searchQuery, ...additionalFilters };
    
    const sortOptions = this.buildSortOptions(filters);
    
    let queryBuilder = this.activityModel.find(finalQuery);
    
    if (sortOptions) {
      queryBuilder = queryBuilder.sort(sortOptions);
    }
    
    if (filters?.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }
    
    if (filters?.offset) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }

    return queryBuilder.exec();
  }

  async getPopularActivities(limit: number = 10): Promise<Activity[]> {
    return this.activityModel
      .find({ isActive: true })
      .sort({ rating: -1, reviewCount: -1 })
      .limit(limit)
      .exec();
  }

  async getActivitiesNearLocation(latitude: number, longitude: number, radiusKm: number = 50): Promise<Activity[]> {
    // Simple distance calculation - in production, you might want to use MongoDB's geospatial queries
    const activities = await this.activityModel.find({ isActive: true }).exec();
    
    return activities.filter(activity => {
      if (!activity.location.latitude || !activity.location.longitude) {
        return false;
      }
      
      const distance = this.calculateDistance(
        latitude, longitude,
        activity.location.latitude, activity.location.longitude
      );
      
      return distance <= radiusKm;
    });
  }

  // Helper Methods
  private buildActivityQuery(filters?: ActivityFiltersInput): any {
    const query: any = { isActive: true };

    if (filters) {
      if (filters.city) {
        query['location.city'] = { $regex: new RegExp(filters.city, 'i') };
      }
      
      if (filters.country) {
        query['location.country'] = { $regex: new RegExp(filters.country, 'i') };
      }
      
      if (filters.category) {
        query['category.name'] = { $regex: new RegExp(filters.category, 'i') };
      }
      
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query['pricing.basePrice'] = {};
        if (filters.minPrice !== undefined) {
          query['pricing.basePrice'].$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          query['pricing.basePrice'].$lte = filters.maxPrice;
        }
      }
      
      if (filters.maxDuration) {
        query.duration = { $lte: filters.maxDuration };
      }
      
      if (filters.fitnessLevel) {
        query['requirements.fitnessLevel'] = { $regex: new RegExp(filters.fitnessLevel, 'i') };
      }
      
      if (filters.skillLevel) {
        query['requirements.skillLevel'] = { $regex: new RegExp(filters.skillLevel, 'i') };
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags.map(tag => new RegExp(tag, 'i')) };
      }
      
      if (filters.seasons && filters.seasons.length > 0) {
        query.bestSeasons = { $in: filters.seasons.map(season => new RegExp(season, 'i')) };
      }
      
      if (filters.minRating) {
        query.rating = { $gte: filters.minRating };
      }
    }

    return query;
  }

  private buildSortOptions(filters?: ActivityFiltersInput): any {
    if (!filters?.sortBy) {
      return { rating: -1, reviewCount: -1 }; // Default sort
    }

    const sortOrder = filters.sortOrder === 'desc' ? -1 : 1;
    
    switch (filters.sortBy) {
      case 'price':
        return { 'pricing.basePrice': sortOrder };
      case 'rating':
        return { rating: sortOrder };
      case 'duration':
        return { duration: sortOrder };
      case 'name':
        return { name: sortOrder };
      default:
        return { rating: -1, reviewCount: -1 };
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Seed activities with comprehensive city mapping
  async seedActivities(): Promise<void> {
    // Clear existing activities to ensure fresh data with all 20 cities
    await this.activityModel.deleteMany({});
    this.logger.log('Cleared existing activities for fresh seed with all 20 cities');
  
    // Get all categories
    const categories = await this.categoryModel.find().exec();
    const categoryMap = categories.reduce((map, cat) => {
      map[cat.name.toLowerCase().replace(/\s+/g, '_')] = cat;
      return map;
    }, {});
  
    // Comprehensive city-activity mapping
    const cityActivityMapping = [
      // Himachal Pradesh - Mountain Activities
      {
        city: 'Manali', country: 'India', state: 'Himachal Pradesh',
        lat: 32.2432, lon: 77.1892,
        activities: [
          {
            name: 'Manali Trekking Adventure',
            description: 'Multi-day trekking expedition through scenic Himalayan trails around Manali',
            category: 'trekking',
            pricing: { basePrice: 5500, currency: 'INR' },
            duration: 480, // 8 hours
            requirements: { minAge: 16, maxAge: 60, fitnessLevel: 'high', skillLevel: 'intermediate' },
            tags: ['trekking', 'mountains', 'himalaya', 'adventure'],
            rating: 4.8, reviewCount: 234
          },
          {
            name: 'Paragliding in Solang Valley',
            description: 'Experience the thrill of paragliding over the beautiful Solang Valley',
            category: 'paragliding',
            pricing: { basePrice: 3500, currency: 'INR' },
            duration: 180, // 3 hours
            requirements: { minAge: 16, maxAge: 55, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['paragliding', 'aerial', 'adventure', 'solang'],
            rating: 4.7, reviewCount: 189
          },
          {
            name: 'Snow Activities Package',
            description: 'Skiing, snowboarding, and snow trekking in the winter wonderland of Manali',
            category: 'snow_activities',
            pricing: { basePrice: 4200, currency: 'INR' },
            duration: 360, // 6 hours
            requirements: { minAge: 12, maxAge: 50, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['skiing', 'snowboarding', 'winter', 'snow'],
            rating: 4.6, reviewCount: 156,
            bestSeasons: ['winter']
          }
        ]
      },
      
      // Uttarakhand - Adventure & Spiritual
      {
        city: 'Rishikesh', country: 'India', state: 'Uttarakhand',
        lat: 30.0869, lon: 78.2676,
        activities: [
          {
            name: 'Ganges White Water Rafting',
            description: 'Navigate through exciting rapids on the holy Ganges river',
            category: 'water_activities',
            pricing: { basePrice: 1800, currency: 'INR' },
            duration: 240, // 4 hours
            requirements: { minAge: 12, maxAge: 65, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['rafting', 'ganges', 'adventure', 'water'],
            rating: 4.8, reviewCount: 567
          },
          {
            name: 'Bungee Jumping at Jumpin Heights',
            description: 'Take the ultimate leap of faith from 83 meters height',
            category: 'bungee_jumping',
            pricing: { basePrice: 3500, currency: 'INR' },
            duration: 120, // 2 hours
            requirements: { minAge: 18, maxAge: 45, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['bungee', 'extreme', 'adrenaline', 'height'],
            rating: 4.9, reviewCount: 298
          },
          {
            name: 'Himalayan Trekking Expedition',
            description: 'Multi-day trekking to scenic viewpoints and mountain peaks',
            category: 'trekking',
            pricing: { basePrice: 6500, currency: 'INR' },
            duration: 720, // 12 hours
            requirements: { minAge: 16, maxAge: 55, fitnessLevel: 'high', skillLevel: 'intermediate' },
            tags: ['trekking', 'himalaya', 'mountains', 'expedition'],
            rating: 4.7, reviewCount: 145
          }
        ]
      },
  
      // Goa - Water Activities
      {
        city: 'Panaji', country: 'India', state: 'Goa',
        lat: 15.4909, lon: 73.8278,
        activities: [
          {
            name: 'Scuba Diving Experience',
            description: 'Explore the underwater world of the Arabian Sea with certified instructors',
            category: 'scuba_diving',
            pricing: { basePrice: 4500, currency: 'INR' },
            duration: 300, // 5 hours
            requirements: { minAge: 18, maxAge: 50, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['scuba', 'diving', 'underwater', 'marine'],
            rating: 4.6, reviewCount: 234
          },
          {
            name: 'Water Sports Package',
            description: 'Jet skiing, banana boat rides, and parasailing combo package',
            category: 'water_activities',
            pricing: { basePrice: 2800, currency: 'INR' },
            duration: 240, // 4 hours
            requirements: { minAge: 14, maxAge: 60, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['watersports', 'jetski', 'parasailing', 'beach'],
            rating: 4.5, reviewCount: 456
          },
          {
            name: 'Sunset Boat Cruise',
            description: 'Romantic sunset cruise along the Goan coastline',
            category: 'boating',
            pricing: { basePrice: 1500, currency: 'INR' },
            duration: 180, // 3 hours
            requirements: { minAge: 5, maxAge: 80, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['boating', 'sunset', 'cruise', 'romantic'],
            rating: 4.4, reviewCount: 189
          }
        ]
      },
  
      // Rajasthan - Desert & Cultural
      {
        city: 'Jaisalmer', country: 'India', state: 'Rajasthan',
        lat: 26.9157, lon: 70.9083,
        activities: [
          {
            name: 'Desert Safari & Camel Trekking',
            description: 'Experience the Thar Desert with camel rides and overnight camping',
            category: 'sight_seeing',
            pricing: { basePrice: 3200, currency: 'INR' },
            duration: 720, // 12 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['desert', 'camel', 'safari', 'camping'],
            rating: 4.7, reviewCount: 345
          },
          {
            name: 'Parasailing over Sand Dunes',
            description: 'Soar above the golden sand dunes of the Thar Desert',
            category: 'paragliding',
            pricing: { basePrice: 2500, currency: 'INR' },
            duration: 120, // 2 hours
            requirements: { minAge: 16, maxAge: 55, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['parasailing', 'desert', 'aerial', 'dunes'],
            rating: 4.5, reviewCount: 123
          }
        ]
      },
  
      // Kerala - Backwaters & Nature
      {
        city: 'Kochi', country: 'India', state: 'Kerala',
        lat: 9.9312, lon: 76.2673,
        activities: [
          {
            name: 'Backwater Houseboat Cruise',
            description: 'Peaceful cruise through Kerala backwaters on traditional houseboats',
            category: 'boating',
            pricing: { basePrice: 4500, currency: 'INR' },
            duration: 480, // 8 hours
            requirements: { minAge: 5, maxAge: 80, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['houseboat', 'backwaters', 'kerala', 'peaceful'],
            rating: 4.8, reviewCount: 267
          },
          {
            name: 'Spice Plantation Trekking',
            description: 'Guided trek through aromatic spice plantations in the Western Ghats',
            category: 'trekking',
            pricing: { basePrice: 1800, currency: 'INR' },
            duration: 300, // 5 hours
            requirements: { minAge: 10, maxAge: 65, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['trekking', 'spices', 'plantation', 'nature'],
            rating: 4.6, reviewCount: 198
          }
        ]
      },
  
      // Karnataka - Wildlife & Adventure
      {
        city: 'Mysore', country: 'India', state: 'Karnataka',
        lat: 12.2958, lon: 76.6394,
        activities: [
          {
            name: 'Bandipur Wildlife Safari',
            description: 'Jungle safari to spot tigers, elephants, and other wildlife',
            category: 'jungle_safari',
            pricing: { basePrice: 2200, currency: 'INR' },
            duration: 240, // 4 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['safari', 'wildlife', 'tigers', 'jungle'],
            rating: 4.7, reviewCount: 234
          },
          {
            name: 'Palace Heritage Tour',
            description: 'Explore the magnificent Mysore Palace and surrounding heritage sites',
            category: 'sight_seeing',
            pricing: { basePrice: 800, currency: 'INR' },
            duration: 180, // 3 hours
            requirements: { minAge: 5, maxAge: 80, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['palace', 'heritage', 'culture', 'history'],
            rating: 4.5, reviewCount: 456
          }
        ]
      },
  
      // Ladakh - High Altitude Adventure
      {
        city: 'Leh', country: 'India', state: 'Ladakh',
        lat: 34.1526, lon: 77.5771,
        activities: [
          {
            name: 'High Altitude Trekking',
            description: 'Trek through the stunning landscapes of Ladakh at high altitude',
            category: 'trekking',
            pricing: { basePrice: 8500, currency: 'INR' },
            duration: 600, // 10 hours
            requirements: { minAge: 18, maxAge: 50, fitnessLevel: 'high', skillLevel: 'advanced' },
            tags: ['trekking', 'ladakh', 'altitude', 'mountains'],
            rating: 4.9, reviewCount: 156
          },
          {
            name: 'Snow Leopard Expedition',
            description: 'Wildlife expedition to spot the elusive snow leopard',
            category: 'jungle_safari',
            pricing: { basePrice: 12000, currency: 'INR' },
            duration: 720, // 12 hours
            requirements: { minAge: 16, maxAge: 60, fitnessLevel: 'high', skillLevel: 'intermediate' },
            tags: ['wildlife', 'snow leopard', 'expedition', 'rare'],
            rating: 4.8, reviewCount: 89
          }
        ]
      },
  
      // Andaman Islands - Marine Activities
      {
        city: 'Port Blair', country: 'India', state: 'Andaman and Nicobar Islands',
        lat: 11.6234, lon: 92.7265,
        activities: [
          {
            name: 'Coral Reef Scuba Diving',
            description: 'Dive into pristine coral reefs and discover marine biodiversity',
            category: 'scuba_diving',
            pricing: { basePrice: 5500, currency: 'INR' },
            duration: 360, // 6 hours
            requirements: { minAge: 18, maxAge: 50, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['scuba', 'coral', 'marine', 'andaman'],
            rating: 4.8, reviewCount: 145
          },
          {
            name: 'Island Hopping Boat Tour',
            description: 'Explore multiple islands with snorkeling and beach activities',
            category: 'boating',
            pricing: { basePrice: 3200, currency: 'INR' },
            duration: 480, // 8 hours
            requirements: { minAge: 10, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['island', 'hopping', 'snorkeling', 'beach'],
            rating: 4.7, reviewCount: 234
          }
        ]
      },
  
      // International Cities
      {
        city: 'Dubai', country: 'UAE', state: 'Dubai',
        lat: 25.2048, lon: 55.2708,
        activities: [
          {
            name: 'Skydiving over Palm Jumeirah',
            description: 'Tandem skydiving with breathtaking views of Dubai skyline',
            category: 'sky_diving',
            pricing: { basePrice: 2000, currency: 'AED' },
            duration: 180, // 3 hours
            requirements: { minAge: 18, maxAge: 60, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['skydiving', 'dubai', 'aerial', 'extreme'],
            rating: 4.9, reviewCount: 567
          },
          {
            name: 'Desert Safari Adventure',
            description: 'Dune bashing, camel riding, and traditional Bedouin experience',
            category: 'sight_seeing',
            pricing: { basePrice: 250, currency: 'AED' },
            duration: 360, // 6 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['desert', 'safari', 'dunes', 'cultural'],
            rating: 4.6, reviewCount: 789
          }
        ]
      },

      // Additional Indian Cities
      {
        city: 'Mumbai', country: 'India', state: 'Maharashtra',
        lat: 19.0760, lon: 72.8777,
        activities: [
          {
            name: 'Mumbai City Heritage Walk',
            description: 'Explore the colonial architecture and bustling markets of Mumbai',
            category: 'sight_seeing',
            pricing: { basePrice: 1200, currency: 'INR' },
            duration: 240, // 4 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['heritage', 'walking', 'culture', 'mumbai'],
            rating: 4.4, reviewCount: 312
          },
          {
            name: 'Elephanta Caves Boat Tour',
            description: 'Ferry ride to UNESCO World Heritage Elephanta Caves',
            category: 'boating',
            pricing: { basePrice: 800, currency: 'INR' },
            duration: 360, // 6 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['caves', 'unesco', 'boat', 'heritage'],
            rating: 4.3, reviewCount: 456
          }
        ]
      },

      {
        city: 'Chennai', country: 'India', state: 'Tamil Nadu',
        lat: 13.0827, lon: 80.2707,
        activities: [
          {
            name: 'Marina Beach Water Sports',
            description: 'Surfing, jet skiing, and beach volleyball at Marina Beach',
            category: 'water_activities',
            pricing: { basePrice: 2200, currency: 'INR' },
            duration: 180, // 3 hours
            requirements: { minAge: 12, maxAge: 55, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['surfing', 'beach', 'watersports', 'marina'],
            rating: 4.2, reviewCount: 234
          },
          {
            name: 'Mahabalipuram Temple Tour',
            description: 'Guided tour of ancient rock-cut temples and sculptures',
            category: 'sight_seeing',
            pricing: { basePrice: 1500, currency: 'INR' },
            duration: 300, // 5 hours
            requirements: { minAge: 10, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['temples', 'heritage', 'sculpture', 'history'],
            rating: 4.6, reviewCount: 189
          }
        ]
      },

      {
        city: 'Kolkata', country: 'India', state: 'West Bengal',
        lat: 22.5726, lon: 88.3639,
        activities: [
          {
            name: 'Sundarbans Mangrove Safari',
            description: 'Boat safari through the largest mangrove forest to spot Royal Bengal Tigers',
            category: 'jungle_safari',
            pricing: { basePrice: 4500, currency: 'INR' },
            duration: 600, // 10 hours
            requirements: { minAge: 12, maxAge: 65, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['safari', 'tigers', 'mangrove', 'wildlife'],
            rating: 4.7, reviewCount: 167
          },
          {
            name: 'Kolkata Heritage Tram Ride',
            description: 'Vintage tram tour through the cultural heart of Kolkata',
            category: 'sight_seeing',
            pricing: { basePrice: 600, currency: 'INR' },
            duration: 120, // 2 hours
            requirements: { minAge: 5, maxAge: 80, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['tram', 'heritage', 'culture', 'vintage'],
            rating: 4.3, reviewCount: 298
          }
        ]
      },

      {
        city: 'Hyderabad', country: 'India', state: 'Telangana',
        lat: 17.3850, lon: 78.4867,
        activities: [
          {
            name: 'Ramoji Film City Tour',
            description: 'Behind-the-scenes tour of the world\'s largest film studio complex',
            category: 'sight_seeing',
            pricing: { basePrice: 1800, currency: 'INR' },
            duration: 480, // 8 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['film', 'studio', 'entertainment', 'bollywood'],
            rating: 4.5, reviewCount: 567
          },
          {
            name: 'Hussain Sagar Lake Boating',
            description: 'Scenic boat ride with views of the Buddha statue',
            category: 'boating',
            pricing: { basePrice: 400, currency: 'INR' },
            duration: 90, // 1.5 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['lake', 'boating', 'buddha', 'scenic'],
            rating: 4.1, reviewCount: 234
          }
        ]
      },

      {
        city: 'Ahmedabad', country: 'India', state: 'Gujarat',
        lat: 23.0225, lon: 72.5714,
        activities: [
          {
            name: 'Rann of Kutch Desert Safari',
            description: 'White desert exploration with cultural performances',
            category: 'sight_seeing',
            pricing: { basePrice: 3500, currency: 'INR' },
            duration: 720, // 12 hours
            requirements: { minAge: 10, maxAge: 65, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['desert', 'culture', 'white', 'kutch'],
            rating: 4.8, reviewCount: 145
          },
          {
            name: 'Sabarmati Riverfront Cycling',
            description: 'Guided cycling tour along the scenic Sabarmati riverfront',
            category: 'sight_seeing',
            pricing: { basePrice: 800, currency: 'INR' },
            duration: 150, // 2.5 hours
            requirements: { minAge: 12, maxAge: 60, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['cycling', 'river', 'fitness', 'scenic'],
            rating: 4.2, reviewCount: 189
          }
        ]
      },

      {
        city: 'Amritsar', country: 'India', state: 'Punjab',
        lat: 31.6340, lon: 74.8723,
        activities: [
          {
            name: 'Golden Temple Heritage Walk',
            description: 'Spiritual and cultural tour of the iconic Golden Temple complex',
            category: 'sight_seeing',
            pricing: { basePrice: 500, currency: 'INR' },
            duration: 180, // 3 hours
            requirements: { minAge: 5, maxAge: 80, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['temple', 'spiritual', 'heritage', 'sikh'],
            rating: 4.9, reviewCount: 678
          },
          {
            name: 'Wagah Border Ceremony',
            description: 'Witness the famous flag-lowering ceremony at India-Pakistan border',
            category: 'sight_seeing',
            pricing: { basePrice: 300, currency: 'INR' },
            duration: 240, // 4 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['border', 'ceremony', 'patriotic', 'cultural'],
            rating: 4.6, reviewCount: 456
          }
        ]
      },

      {
        city: 'Bhubaneswar', country: 'India', state: 'Odisha',
        lat: 20.2961, lon: 85.8245,
        activities: [
          {
            name: 'Konark Sun Temple Tour',
            description: 'UNESCO World Heritage site tour of the magnificent Sun Temple',
            category: 'sight_seeing',
            pricing: { basePrice: 1200, currency: 'INR' },
            duration: 300, // 5 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['temple', 'unesco', 'heritage', 'architecture'],
            rating: 4.7, reviewCount: 234
          },
          {
            name: 'Chilika Lake Dolphin Watching',
            description: 'Boat tour to spot Irrawaddy dolphins in Asia\'s largest brackish water lagoon',
            category: 'boating',
            pricing: { basePrice: 2200, currency: 'INR' },
            duration: 360, // 6 hours
            requirements: { minAge: 10, maxAge: 65, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['dolphins', 'lake', 'wildlife', 'boat'],
            rating: 4.5, reviewCount: 167
          }
        ]
      },

      {
        city: 'Guwahati', country: 'India', state: 'Assam',
        lat: 26.1445, lon: 91.7362,
        activities: [
          {
            name: 'Kaziranga Rhino Safari',
            description: 'Jeep safari to spot one-horned rhinoceros in Kaziranga National Park',
            category: 'jungle_safari',
            pricing: { basePrice: 3800, currency: 'INR' },
            duration: 480, // 8 hours
            requirements: { minAge: 12, maxAge: 65, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['rhino', 'safari', 'wildlife', 'kaziranga'],
            rating: 4.8, reviewCount: 189
          },
          {
            name: 'Brahmaputra River Cruise',
            description: 'Sunset cruise on the mighty Brahmaputra river',
            category: 'boating',
            pricing: { basePrice: 1500, currency: 'INR' },
            duration: 180, // 3 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['river', 'cruise', 'sunset', 'brahmaputra'],
            rating: 4.4, reviewCount: 145
          }
        ]
      },

      {
        city: 'Bhopal', country: 'India', state: 'Madhya Pradesh',
        lat: 23.2599, lon: 77.4126,
        activities: [
          {
            name: 'Sanchi Stupa Heritage Tour',
            description: 'UNESCO World Heritage Buddhist monuments tour',
            category: 'sight_seeing',
            pricing: { basePrice: 1000, currency: 'INR' },
            duration: 240, // 4 hours
            requirements: { minAge: 10, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['buddhist', 'stupa', 'heritage', 'unesco'],
            rating: 4.5, reviewCount: 123
          },
          {
            name: 'Upper Lake Boating',
            description: 'Peaceful boat ride on the scenic Upper Lake',
            category: 'boating',
            pricing: { basePrice: 600, currency: 'INR' },
            duration: 120, // 2 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['lake', 'boating', 'peaceful', 'scenic'],
            rating: 4.2, reviewCount: 167
          }
        ]
      },

      {
        city: 'Raipur', country: 'India', state: 'Chhattisgarh',
        lat: 21.2514, lon: 81.6296,
        activities: [
          {
            name: 'Chitrakote Falls Trek',
            description: 'Trekking to India\'s widest waterfall, the "Niagara of India"',
            category: 'trekking',
            pricing: { basePrice: 2500, currency: 'INR' },
            duration: 420, // 7 hours
            requirements: { minAge: 14, maxAge: 55, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['waterfall', 'trekking', 'nature', 'chitrakote'],
            rating: 4.6, reviewCount: 98
          },
          {
            name: 'Tribal Village Cultural Tour',
            description: 'Experience the rich tribal culture and traditions of Chhattisgarh',
            category: 'sight_seeing',
            pricing: { basePrice: 1800, currency: 'INR' },
            duration: 360, // 6 hours
            requirements: { minAge: 10, maxAge: 65, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['tribal', 'culture', 'village', 'tradition'],
            rating: 4.4, reviewCount: 76
          }
        ]
      },

      {
        city: 'Ranchi', country: 'India', state: 'Jharkhand',
        lat: 23.3441, lon: 85.3096,
        activities: [
          {
            name: 'Hundru Falls Adventure',
            description: 'Trekking and rappelling at the spectacular Hundru waterfall',
            category: 'trekking',
            pricing: { basePrice: 2800, currency: 'INR' },
            duration: 360, // 6 hours
            requirements: { minAge: 16, maxAge: 50, fitnessLevel: 'high', skillLevel: 'intermediate' },
            tags: ['waterfall', 'rappelling', 'adventure', 'hundru'],
            rating: 4.7, reviewCount: 134
          },
          {
            name: 'Rock Garden Nature Walk',
            description: 'Peaceful walk through the beautiful Rock Garden with natural formations',
            category: 'sight_seeing',
            pricing: { basePrice: 400, currency: 'INR' },
            duration: 150, // 2.5 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['garden', 'nature', 'rocks', 'peaceful'],
            rating: 4.1, reviewCount: 189
          }
        ]
      },

      // International Cities
      {
        city: 'Bangkok', country: 'Thailand', state: 'Bangkok',
        lat: 13.7563, lon: 100.5018,
        activities: [
          {
            name: 'Chao Phraya River Cruise',
            description: 'Traditional longtail boat cruise through Bangkok\'s historic waterways',
            category: 'boating',
            pricing: { basePrice: 1200, currency: 'THB' },
            duration: 180, // 3 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['river', 'cruise', 'temples', 'culture'],
            rating: 4.6, reviewCount: 456
          },
          {
            name: 'Thai Cooking Class Experience',
            description: 'Learn to cook authentic Thai dishes with local chefs',
            category: 'sight_seeing',
            pricing: { basePrice: 1800, currency: 'THB' },
            duration: 240, // 4 hours
            requirements: { minAge: 12, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['cooking', 'thai', 'culture', 'food'],
            rating: 4.8, reviewCount: 234
          }
        ]
      },

      {
        city: 'Kathmandu', country: 'Nepal', state: 'Bagmati',
        lat: 27.7172, lon: 85.3240,
        activities: [
          {
            name: 'Everest Base Camp Helicopter Tour',
            description: 'Scenic helicopter flight to Everest Base Camp with mountain landing',
            category: 'sight_seeing',
            pricing: { basePrice: 85000, currency: 'NPR' },
            duration: 300, // 5 hours
            requirements: { minAge: 12, maxAge: 65, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['everest', 'helicopter', 'mountains', 'scenic'],
            rating: 4.9, reviewCount: 167
          },
          {
            name: 'Annapurna Circuit Trekking',
            description: 'Multi-day trekking adventure in the Annapurna mountain range',
            category: 'trekking',
            pricing: { basePrice: 45000, currency: 'NPR' },
            duration: 1440, // 24 hours (multi-day)
            requirements: { minAge: 16, maxAge: 55, fitnessLevel: 'high', skillLevel: 'advanced' },
            tags: ['annapurna', 'trekking', 'mountains', 'adventure'],
            rating: 4.8, reviewCount: 89
          }
        ]
      },

      {
        city: 'Colombo', country: 'Sri Lanka', state: 'Western Province',
        lat: 6.9271, lon: 79.8612,
        activities: [
          {
            name: 'Whale Watching Excursion',
            description: 'Boat trip to spot blue whales and dolphins off the Sri Lankan coast',
            category: 'water_activities',
            pricing: { basePrice: 8500, currency: 'LKR' },
            duration: 480, // 8 hours
            requirements: { minAge: 10, maxAge: 65, fitnessLevel: 'intermediate', skillLevel: 'none' },
            tags: ['whales', 'dolphins', 'marine', 'boat'],
            rating: 4.7, reviewCount: 234
          },
          {
            name: 'Colombo City Heritage Tour',
            description: 'Explore colonial architecture and vibrant markets of Colombo',
            category: 'sight_seeing',
            pricing: { basePrice: 3500, currency: 'LKR' },
            duration: 240, // 4 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['heritage', 'colonial', 'markets', 'culture'],
            rating: 4.3, reviewCount: 189
          }
        ]
      },

      {
        city: 'Male', country: 'Maldives', state: 'Kaafu Atoll',
        lat: 4.1755, lon: 73.5093,
        activities: [
          {
            name: 'Maldivian Reef Scuba Diving',
            description: 'Explore pristine coral reefs and encounter manta rays',
            category: 'scuba_diving',
            pricing: { basePrice: 120, currency: 'USD' },
            duration: 240, // 4 hours
            requirements: { minAge: 18, maxAge: 55, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['scuba', 'reef', 'manta', 'coral'],
            rating: 4.9, reviewCount: 345
          },
          {
            name: 'Sunset Dolphin Cruise',
            description: 'Romantic sunset cruise with dolphin watching',
            category: 'boating',
            pricing: { basePrice: 85, currency: 'USD' },
            duration: 180, // 3 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['sunset', 'dolphins', 'cruise', 'romantic'],
            rating: 4.8, reviewCount: 267
          }
        ]
      },

      {
        city: 'Singapore', country: 'Singapore', state: 'Singapore',
        lat: 1.3521, lon: 103.8198,
        activities: [
          {
            name: 'Gardens by the Bay Sky Walk',
            description: 'Walk among the iconic Supertrees and explore the Cloud Forest',
            category: 'sight_seeing',
            pricing: { basePrice: 45, currency: 'SGD' },
            duration: 180, // 3 hours
            requirements: { minAge: 6, maxAge: 75, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['gardens', 'supertrees', 'nature', 'modern'],
            rating: 4.7, reviewCount: 567
          },
          {
            name: 'Singapore River Bumboat Cruise',
            description: 'Historic bumboat cruise along Singapore River with city skyline views',
            category: 'boating',
            pricing: { basePrice: 25, currency: 'SGD' },
            duration: 120, // 2 hours
            requirements: { minAge: 5, maxAge: 80, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['river', 'skyline', 'historic', 'bumboat'],
            rating: 4.4, reviewCount: 234
          }
        ]
      },

      {
        city: 'Kuala Lumpur', country: 'Malaysia', state: 'Federal Territory',
        lat: 3.1390, lon: 101.6869,
        activities: [
          {
            name: 'Petronas Twin Towers Sky Bridge',
            description: 'Visit the iconic sky bridge connecting the Petronas Twin Towers',
            category: 'sight_seeing',
            pricing: { basePrice: 85, currency: 'MYR' },
            duration: 150, // 2.5 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['towers', 'skybridge', 'iconic', 'city'],
            rating: 4.6, reviewCount: 456
          },
          {
            name: 'Batu Caves Temple Trek',
            description: 'Climb the 272 steps to the sacred Hindu temple in limestone caves',
            category: 'trekking',
            pricing: { basePrice: 25, currency: 'MYR' },
            duration: 180, // 3 hours
            requirements: { minAge: 10, maxAge: 65, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['caves', 'temple', 'hindu', 'limestone'],
            rating: 4.5, reviewCount: 345
          }
        ]
      },

      {
        city: 'Bali', country: 'Indonesia', state: 'Bali',
        lat: -8.3405, lon: 115.0920,
        activities: [
          {
            name: 'Mount Batur Sunrise Trekking',
            description: 'Early morning trek to witness spectacular sunrise from Mount Batur volcano',
            category: 'trekking',
            pricing: { basePrice: 450000, currency: 'IDR' },
            duration: 360, // 6 hours
            requirements: { minAge: 14, maxAge: 55, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['volcano', 'sunrise', 'trekking', 'batur'],
            rating: 4.8, reviewCount: 234
          },
          {
            name: 'Ubud Rice Terrace Cycling',
            description: 'Scenic cycling tour through traditional rice terraces and villages',
            category: 'sight_seeing',
            pricing: { basePrice: 350000, currency: 'IDR' },
            duration: 240, // 4 hours
            requirements: { minAge: 12, maxAge: 60, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['cycling', 'rice', 'terraces', 'ubud'],
            rating: 4.6, reviewCount: 189
          }
        ]
      },

      {
        city: 'Thimphu', country: 'Bhutan', state: 'Thimphu',
        lat: 27.4728, lon: 89.6390,
        activities: [
          {
            name: 'Tiger\'s Nest Monastery Trek',
            description: 'Sacred trek to the iconic Paro Taktsang monastery perched on a cliff',
            category: 'trekking',
            pricing: { basePrice: 3500, currency: 'BTN' },
            duration: 360, // 6 hours
            requirements: { minAge: 14, maxAge: 60, fitnessLevel: 'intermediate', skillLevel: 'basic' },
            tags: ['monastery', 'sacred', 'cliff', 'tigers'],
            rating: 4.9, reviewCount: 123
          },
          {
            name: 'Thimphu Cultural Heritage Tour',
            description: 'Explore traditional dzongs, markets, and Buddhist temples',
            category: 'sight_seeing',
            pricing: { basePrice: 2500, currency: 'BTN' },
            duration: 300, // 5 hours
            requirements: { minAge: 8, maxAge: 70, fitnessLevel: 'beginner', skillLevel: 'none' },
            tags: ['culture', 'dzongs', 'buddhist', 'heritage'],
            rating: 4.7, reviewCount: 167
          }
        ]
      }
    ];
  
    // Create activities for each city
    const allActivities: any[] = []; // Fix the type declaration
    
    for (const cityData of cityActivityMapping) {
      for (const activityData of cityData.activities) {
        const categoryKey = activityData.category.toLowerCase().replace(/\s+/g, '_');
        const category = categoryMap[categoryKey];
        
        if (!category) {
          this.logger.warn(`Category not found: ${activityData.category}`);
          continue;
        }
  
        const activity = {
          name: activityData.name,
          description: activityData.description,
          category: category,
          location: {
            city: cityData.city,
            country: cityData.country,
            state: cityData.state,
            latitude: cityData.lat,
            longitude: cityData.lon
          },
          pricing: {
            basePrice: activityData.pricing.basePrice,
            currency: activityData.pricing.currency,
            priceIncludes: 'Equipment, guide, safety briefing'
          },
          requirements: activityData.requirements,
          duration: activityData.duration,
          maxParticipants: 12,
          rating: activityData.rating,
          reviewCount: activityData.reviewCount,
          tags: activityData.tags,
          bestSeasons: activityData.bestSeasons || ['spring', 'summer', 'autumn'],
          operatingHours: ['9:00 AM - 5:00 PM'],
          isActive: true
        };
  
        allActivities.push(activity);
      }
    }
  
    try {
      await this.activityModel.insertMany(allActivities);
      this.logger.log(`Successfully seeded ${allActivities.length} activities across ${cityActivityMapping.length} cities`);
    } catch (error) {
      this.logger.error('Error seeding activities:', error);
    }
  }

  // Get activities by city with detailed information
  async getActivitiesByCity(city: string, filters?: ActivityFiltersInput): Promise<Activity[]> {
    const query: any = { 
      isActive: true,
      'location.city': { $regex: new RegExp(city, 'i') }
    };
  
    // Apply additional filters
    if (filters) {
      if (filters.category) {
        query['category.name'] = { $regex: new RegExp(filters.category, 'i') };
      }
      
      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query['pricing.basePrice'] = {};
        if (filters.minPrice !== undefined) {
          query['pricing.basePrice'].$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          query['pricing.basePrice'].$lte = filters.maxPrice;
        }
      }
      
      if (filters.maxDuration) {
        query.duration = { $lte: filters.maxDuration };
      }
      
      if (filters.fitnessLevel) {
        query['requirements.fitnessLevel'] = { $regex: new RegExp(filters.fitnessLevel, 'i') };
      }
      
      if (filters.minRating) {
        query.rating = { $gte: filters.minRating };
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags.map(tag => new RegExp(tag, 'i')) };
      }
    }
  
    const sortOptions = this.buildSortOptions(filters);
    
    let queryBuilder = this.activityModel.find(query);
    
    if (sortOptions) {
      queryBuilder = queryBuilder.sort(sortOptions);
    }
    
    if (filters?.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }
    
    if (filters?.offset) {
      queryBuilder = queryBuilder.skip(filters.offset);
    }
  
    return queryBuilder.exec();
  }
  
  // Get city statistics with activity counts
  async getCityActivityStats(): Promise<any[]> {
    const results = await this.activityModel.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: {
            city: '$location.city',
            country: '$location.country'
          },
          totalActivities: { $sum: 1 },
          categories: { $addToSet: '$category.name' },
          averagePrice: { $avg: '$pricing.basePrice' },
          averageRating: { $avg: '$rating' },
          currency: { $first: '$pricing.currency' }
        }
      },
      {
        $sort: { totalActivities: -1 }
      }
    ]);
  
    // Transform the results to match the GraphQL schema
    return results.map(result => ({
      city: result._id.city,
      country: result._id.country,
      totalActivities: result.totalActivities,
      categories: result.categories,
      averagePrice: result.averagePrice ? Math.round(result.averagePrice * 100) / 100 : null,
      averageRating: result.averageRating ? Math.round(result.averageRating * 10) / 10 : null,
      currency: result.currency || 'INR'
    }));
  }
}