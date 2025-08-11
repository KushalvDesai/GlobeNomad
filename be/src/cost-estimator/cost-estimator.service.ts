import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface CityCoords {
  lat: number;
  lon: number;
}

@Injectable()
export class CostEstimatorService {
  private readonly logger = new Logger(CostEstimatorService.name);
  private cityCoordsMap = new Map<string, CityCoords>();
  private OPENCAGE_KEY = process.env.OPENCAGE_API_KEY;
  private GRAPHOPPER_KEY = process.env.GRAPHHOPPER_API_KEY;

  constructor() {
    this.loadCityCSV();
  }

  private loadCityCSV() {
    try {
      const csvPath = path.resolve(process.cwd(), 'mnt/data/top_travel_cities.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // Skip header row (first line)
      for (const line of lines.slice(1)) {
        const [city, lat, lon] = line.split(',').map(item => item.trim());
        if (city && lat && lon && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
          this.cityCoordsMap.set(city.toLowerCase(), {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
          });
        }
      }
      this.logger.log(`Loaded ${this.cityCoordsMap.size} cities from CSV`);
    } catch (error) {
      this.logger.error(`Error loading CSV: ${error.message}`);
    }
  }

  // Geocode city with CSV fallback, then OpenCage API
  async getCityCoordinates(city: string): Promise<CityCoords> {
    const cityKey = city.trim().toLowerCase();
    if (this.cityCoordsMap.has(cityKey)) {
      this.logger.debug(`Found city '${city}' in CSV`);
      const coords = this.cityCoordsMap.get(cityKey);
      if (coords) {
        return coords;
      }
    }
    this.logger.log(`City '${city}' not in CSV. Querying OpenCage API...`);

    if (!this.OPENCAGE_KEY) {
      throw new Error('OPENCAGE_API_KEY environment variable is not set');
    }

    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${this.OPENCAGE_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          lat: result.geometry.lat,
          lon: result.geometry.lng,
        };
      } else {
        throw new Error(`No results found for city: ${city}`);
      }
    } catch (error) {
      this.logger.error(`Error geocoding city ${city}: ${error.message}`);
      throw new Error(`Failed to geocode city: ${city}`);
    }
  }

  // Calculate straight-line distance using Haversine formula (fallback)
  private calculateHaversineDistance(origin: CityCoords, destination: CityCoords): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(destination.lat - origin.lat);
    const dLon = this.toRadians(destination.lon - origin.lon);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.lat)) * Math.cos(this.toRadians(destination.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // Apply a factor to approximate road distance (typically 1.2-1.4x straight-line)
    const roadDistance = parseFloat((distance * 1.3).toFixed(2));
    this.logger.debug(`Haversine distance: ${distance.toFixed(2)} km (straight-line), ${roadDistance} km (estimated road distance)`);
    return roadDistance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate distance in km using GraphHopper API with Haversine fallback
  async getDistanceKm(origin: CityCoords, destination: CityCoords): Promise<number> {
    // Try GraphHopper API first if key is available
    if (this.GRAPHOPPER_KEY) {
      try {
        const url = `https://graphhopper.com/api/1/route?point=${origin.lat},${origin.lon}&point=${destination.lat},${destination.lon}&vehicle=car&locale=en&key=${this.GRAPHOPPER_KEY}&points_encoded=false`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.paths && data.paths.length > 0) {
          const distance = parseFloat((data.paths[0].distance / 1000).toFixed(2));
          this.logger.debug(`GraphHopper distance: ${distance} km`);
          return distance;
        } else {
          this.logger.warn('GraphHopper API: No route found, falling back to Haversine calculation');
          return this.calculateHaversineDistance(origin, destination);
        }
      } catch (error) {
        this.logger.warn(`GraphHopper API error: ${error.message}, falling back to Haversine calculation`);
        return this.calculateHaversineDistance(origin, destination);
      }
    } else {
      this.logger.warn('GRAPHHOPPER_API_KEY not set, using Haversine calculation');
      return this.calculateHaversineDistance(origin, destination);
    }
  }

  // Calculate travel cost based on distance and mode of transport (in INR)
  calculateTravelCost(distanceKm: number, travelers: number): number {
    // Determine travel mode based on distance
    if (distanceKm > 1000) {
      // Long distance: Flight required (prices in INR)
      let baseCostPerPerson = 0;
      
      if (distanceKm < 2000) {
        // Regional flights (1000-2000 km) - Domestic flights in India
        baseCostPerPerson = 8000; // ₹8,000 per person one-way
      } else if (distanceKm < 5000) {
        // Medium-haul flights (2000-5000 km) - Regional international
        baseCostPerPerson = 25000; // ₹25,000 per person one-way
      } else if (distanceKm < 8000) {
        // Long-haul flights (5000-8000 km) - International flights
        baseCostPerPerson = 60000; // ₹60,000 per person one-way
      } else {
        // Ultra long-haul flights (8000+ km) - Long international flights
        baseCostPerPerson = 90000; // ₹90,000 per person one-way
      }
      
      // Add distance-based premium (for very long flights)
      const distancePremium = Math.max(0, (distanceKm - 5000) * 5); // ₹5 per extra km
      const totalCostPerPerson = baseCostPerPerson + distancePremium;
      
      // Round trip cost for all travelers
      const totalCost = totalCostPerPerson * 2 * travelers; // Round trip
      
      this.logger.debug(`Flight cost calculation: ${distanceKm}km, ₹${totalCostPerPerson.toFixed(2)} per person one-way, ₹${totalCost.toFixed(2)} total for ${travelers} travelers round-trip`);
      return parseFloat(totalCost.toFixed(2));
      
    } else if (distanceKm > 300) {
      // Medium distance: Train or bus (prices in INR)
      const costPerKm = 3; // ₹3 per km per person (AC train/bus)
      const roundTripDistance = distanceKm * 2;
      const totalCost = roundTripDistance * costPerKm * travelers;
      
      this.logger.debug(`Train/Bus cost calculation: ${distanceKm}km, ₹${totalCost.toFixed(2)} total for ${travelers} travelers`);
      return parseFloat(totalCost.toFixed(2));
      
    } else {
      // Short distance: Car/driving (prices in INR)
      // Fuel consumption: 15km/L, Fuel price: ₹100/L
      // Vehicle wear and tear: ₹8/km, Tolls and parking: ₹5/km
      const fuelCostPerKm = 100 / 15; // ₹6.67 per km
      const wearTearPerKm = 8; // ₹8 per km
      const tollsPerKm = 5; // ₹5 per km
      
      const totalCostPerKm = fuelCostPerKm + wearTearPerKm + tollsPerKm; // ₹19.67 per km
      const roundTripDistance = distanceKm * 2; // Round trip
      const totalCost = roundTripDistance * totalCostPerKm;
      
      this.logger.debug(`Driving cost calculation: ${distanceKm}km, ₹${totalCost.toFixed(2)} total (shared among ${travelers} travelers)`);
      return parseFloat(totalCost.toFixed(2));
    }
  }

  // Simple fallback hotel price estimation based on city (in INR)
  async getHotelPrice(city: string): Promise<number> {
    const cityKey = city.trim().toLowerCase();
    
    // Major expensive cities (international)
    const expensiveCities = ['new york', 'london', 'paris', 'tokyo', 'singapore', 'zurich', 'geneva'];
    // Moderate cities (international/major Indian cities)
    const moderateCities = ['berlin', 'madrid', 'rome', 'amsterdam', 'barcelona', 'vienna', 'mumbai', 'delhi', 'bangalore'];
    // Indian cities
    const indianCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'goa'];
    
    if (expensiveCities.some(c => cityKey.includes(c))) {
      return 15000; // ₹15,000 per night per room (luxury international hotels)
    } else if (moderateCities.some(c => cityKey.includes(c))) {
      return 8000; // ₹8,000 per night per room (good hotels)
    } else if (indianCities.some(c => cityKey.includes(c))) {
      return 4000; // ₹4,000 per night per room (Indian cities)
    } else {
      return 5000; // ₹5,000 per night per room (default for other cities)
    }
  }

  // Simple heuristic for meal cost per person per day (in INR)
  async getMealCost(city: string): Promise<number> {
    const cityKey = city.trim().toLowerCase();
    
    // Different meal costs based on city type
    const expensiveCities = ['new york', 'london', 'paris', 'tokyo', 'singapore', 'zurich', 'geneva'];
    const moderateCities = ['berlin', 'madrid', 'rome', 'amsterdam', 'barcelona', 'vienna'];
    const indianCities = ['mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 'jaipur', 'goa'];
    
    if (expensiveCities.some(c => cityKey.includes(c))) {
      return 3000; // ₹3,000 per person per day (expensive international cities)
    } else if (moderateCities.some(c => cityKey.includes(c))) {
      return 2000; // ₹2,000 per person per day (moderate international cities)
    } else if (indianCities.some(c => cityKey.includes(c))) {
      return 800; // ₹800 per person per day (Indian cities)
    } else {
      return 1500; // ₹1,500 per person per day (default for other cities)
    }
  }

  // Main function to estimate trip cost
  async estimateTripCost(
    originCity: string,
    destCity: string,
    days: number,
    travelers: number,
  ): Promise<{ 
    distanceKm: number; 
    travelCost: number;
    hotelCost: number; 
    mealCost: number; 
    totalCost: number 
  }> {
    try {
      const origin = await this.getCityCoordinates(originCity);
      const destination = await this.getCityCoordinates(destCity);

      const distanceKm = await this.getDistanceKm(origin, destination);
      
      // Calculate costs
      const travelCost = this.calculateTravelCost(distanceKm, travelers);
      const hotelPricePerNight = await this.getHotelPrice(destCity);
      const mealPricePerPersonPerDay = await this.getMealCost(destCity);

      // Calculate total costs for all travelers and all days
      const hotelCost = parseFloat((hotelPricePerNight * days).toFixed(2)); // Hotel cost (assuming shared rooms)
      const mealCost = parseFloat((mealPricePerPersonPerDay * days * travelers).toFixed(2)); // Meal cost for all travelers
      const totalCost = parseFloat((travelCost + hotelCost + mealCost).toFixed(2));

      this.logger.log(`Trip cost calculated: ${originCity} to ${destCity}, ${distanceKm}km, ₹${totalCost} total for ${travelers} travelers`);

      return {
        distanceKm,
        travelCost,
        hotelCost,
        mealCost,
        totalCost,
      };
    } catch (error) {
      this.logger.error(`Error estimating trip cost: ${error.message}`);
      throw error;
    }
  }
}
