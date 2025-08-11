import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from '../trip/schema/trip.schema';
import { ActivitiesService } from '../activities/activities.service';
import { CityWithActivities } from './dto/city-with-activities.dto';
import { ActivityFiltersInput } from '../activities/dto/activity-filters.input';
import * as fs from 'fs';
import * as path from 'path';

export interface CityDetails {
  id: string;
  name: string;
  country: string;
  description?: string;
  attractions?: string[];
  averageCost?: number;
}

export interface CityFilters {
  country?: string;
  minCost?: number;
  maxCost?: number;
}

interface CityData {
  name: string;
  country: string;
  cost: number;
}

@Injectable()
export class CitiesService {
  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
    private activitiesService: ActivitiesService,
  ) {}

  private readCsvData(): CityData[] {
    try {
      const csvPath = path.resolve(process.cwd(), 'top_travel_cities_costs.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      return lines.slice(1).map(line => {
        const [name, country, cost] = line.split(',').map(item => item.trim());
        return {
          name,
          country,
          cost: parseFloat(cost) || 0
        };
      });
    } catch (error) {
      console.error('Error reading CSV file:', error);
      return [];
    }
  }

  async searchCities(query: string, filters?: CityFilters): Promise<string[]> {
    let cities = this.readCsvData();

    // Filter by search query
    if (query) {
      cities = cities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply additional filters
    if (filters) {
      if (filters.country) {
        cities = cities.filter(city => 
          city.country.toLowerCase() === filters.country?.toLowerCase()
        );
      }
      
      if (filters.minCost !== undefined) {
        cities = cities.filter(city => city.cost >= filters.minCost!);
      }
      
      if (filters.maxCost !== undefined) {
        cities = cities.filter(city => city.cost <= filters.maxCost!);
      }
    }

    return cities.map(city => city.name);
  }

  async getCityDetails(cityId: string): Promise<CityDetails> {
    const cities = this.readCsvData();
    const city = cities.find(c => c.name.toLowerCase() === cityId.toLowerCase());
    
    if (!city) {
      throw new NotFoundException(`City with id ${cityId} not found`);
    }

    return {
      id: cityId,
      name: city.name,
      country: city.country,
      description: `Beautiful city of ${city.name}`,
      attractions: [`${city.name} Museum`, `${city.name} Park`, `${city.name} Cathedral`],
      averageCost: city.cost,
    };
  }

  async getCityWithActivities(
    cityName: string, 
    activityFilters?: ActivityFiltersInput
  ): Promise<CityWithActivities> {
    const cityDetails = await this.getCityDetails(cityName);
    const activities = await this.activitiesService.getActivitiesByCity(cityName, activityFilters);
    
    const categories = [...new Set(activities.map(activity => activity.category.name))];
    const totalActivities = activities.length;
    const averagePrice = activities.length > 0 
      ? activities.reduce((sum, activity) => sum + activity.pricing.basePrice, 0) / activities.length 
      : undefined;
    const averageRating = activities.length > 0 
      ? activities.reduce((sum, activity) => sum + (activity.rating || 0), 0) / activities.length 
      : undefined;

    return {
      cityName: cityDetails.name,
      country: cityDetails.country,
      activities,
      totalActivities,
      availableCategories: categories,
      averagePrice,
      averageRating
    };
  }

  async getPopularCitiesWithActivities(limit: number = 10): Promise<CityWithActivities[]> {
    const cities = this.readCsvData().slice(0, limit);
    const citiesWithActivities: CityWithActivities[] = [];

    for (const city of cities) {
      try {
        const cityWithActivities = await this.getCityWithActivities(city.name);
        if (cityWithActivities.totalActivities > 0) {
          citiesWithActivities.push(cityWithActivities);
        }
      } catch (error) {
        // Skip cities that don't have activities or encounter errors
        continue;
      }
    }

    return citiesWithActivities.sort((a, b) => b.totalActivities - a.totalActivities);
  }

  async addCityToTrip(tripId: string, cityId: string, userId: string): Promise<boolean> {
    const trip = await this.tripModel.findById(tripId).exec();
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Check if user owns the trip
    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('Unauthorized to modify this trip');
    }

    // Here you would implement the logic to add a city to a trip
    // This might involve updating the trip document or creating itinerary items
    
    return true;
  }
}