import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Trip, TripDocument } from '../trip/schema/trip.schema';
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

@Injectable()
export class CitiesService {
  private readonly csvPath: string;

  constructor(
    @InjectModel(Trip.name) private tripModel: Model<TripDocument>,
  ) {
    this.csvPath = path.resolve(process.cwd(), 'mnt/data/top_travel_cities.csv');
  }

  private readCsvData() {
    try {
      const csvContent = fs.readFileSync(this.csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      return lines.slice(1).map(line => {
        const [name, country, cost = '100'] = line.split(',').map(item => item.trim());
        return { name, country, cost: parseInt(cost) || 100 };
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
        cities = cities.filter(city => city.cost >= (filters.minCost ?? 0));
      }
      if (filters.maxCost !== undefined) {
        cities = cities.filter(city => city.cost <= (filters.maxCost ?? Infinity));
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

  async addCityToTrip(tripId: string, cityId: string, userId: string): Promise<boolean> {
    const trip = await this.tripModel.findById(tripId).exec();
    
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // Check if user owns the trip
    if (trip.owner.toString() !== userId) {
      throw new ForbiddenException('Unauthorized to modify this trip');
    }

    // Verify the city exists
    const cityDetails = await this.getCityDetails(cityId);
    if (!cityDetails) {
      throw new NotFoundException(`City ${cityId} not found`);
    }

    // Since Trip schema doesn't have cities field, we'll store city info in description
    // In a production app, you should add a cities field to Trip schema
    const currentDescription = trip.description || '';
    const cityName = cityDetails.name;
    
    // Check if city is already mentioned in description
    if (currentDescription.toLowerCase().includes(cityName.toLowerCase())) {
      return false; // City already added
    }

    const updatedDescription = currentDescription 
      ? `${currentDescription}. Visiting ${cityName}` 
      : `Visiting ${cityName}`;

    await this.tripModel.findByIdAndUpdate(
      tripId,
      { description: updatedDescription, updatedAt: new Date() },
      { new: true }
    ).exec();

    return true;
  }
}