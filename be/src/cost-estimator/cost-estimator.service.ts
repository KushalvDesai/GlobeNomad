import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { BriefCostService } from '../ai-cost-service/brief-cost.service';
import { StayType, MealType } from '../ai-cost-service/dto/brief-cost-estimate.dto';
import { AiCostPreference, AiMealPreference } from './dto/ai-enhanced-trip-cost.dto';

interface CityCoords {
  lat: number;
  lon: number;
}

interface CityCosts {
  cityName: string;
  lat: number;
  lon: number;
  mealsBasic: number;
  mealsMedium: number;
  mealsLuxury: number;
  hotelBasic: number;
  hotelMedium: number;
  hotelLuxury: number;
}

interface AmadeusFlightOffer {
  price: {
    total: string;
    currency: string;
  };
}

@Injectable()
export class CostEstimatorService {
  private readonly logger = new Logger(CostEstimatorService.name);
  private cityCoordsMap = new Map<string, CityCoords>();
  private cityCostsMap = new Map<string, CityCosts>();
  private readonly USD_TO_INR = 83; // Current USD to INR conversion rate
  private readonly OPENCAGE_KEY = process.env.OPENCAGE_API_KEY;
  private readonly GRAPHHOPPER_API_KEY = process.env.GRAPHHOPPER_API_KEY;
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // For cost APIs
  private readonly AMADEUS_CLIENT_ID = process.env.AMADEUS_CLIENT_ID;
  private readonly AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET;
  private amadeusToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly briefCostService: BriefCostService) {
    this.loadCityCSV();
    this.loadCityCostsCSV();
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
      this.logger.log(`Loaded ${this.cityCoordsMap.size} cities from coordinates CSV`);
    } catch (error) {
      this.logger.error(`Error loading coordinates CSV: ${error.message}`);
    }
  }

  private loadCityCostsCSV() {
    try {
      const csvPath = path.resolve(process.cwd(), 'mnt/data/top_travel_cities_500_costs.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      // Skip header row (first line)
      for (const line of lines.slice(1)) {
        const parts = line.split(',').map(item => item.trim());
        if (parts.length >= 8) {
          const [cityName, lat, lon, mealsBasic, mealsMedium, mealsLuxury, hotelBasic, hotelMedium, hotelLuxury] = parts;
          
          if (cityName && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon))) {
            const cityCosts: CityCosts = {
              cityName,
              lat: parseFloat(lat),
              lon: parseFloat(lon),
              mealsBasic: parseFloat(mealsBasic) * this.USD_TO_INR, // Convert USD to INR
              mealsMedium: parseFloat(mealsMedium) * this.USD_TO_INR,
              mealsLuxury: parseFloat(mealsLuxury) * this.USD_TO_INR,
              hotelBasic: parseFloat(hotelBasic) * this.USD_TO_INR,
              hotelMedium: parseFloat(hotelMedium) * this.USD_TO_INR,
              hotelLuxury: parseFloat(hotelLuxury) * this.USD_TO_INR,
            };
            
            this.cityCostsMap.set(cityName.toLowerCase(), cityCosts);
          }
        }
      }
      this.logger.log(`Loaded ${this.cityCostsMap.size} cities with costs from CSV (USD converted to INR at rate ${this.USD_TO_INR})`);
    } catch (error) {
      this.logger.error(`Error loading costs CSV: ${error.message}`);
    }
  }

  // Geocode city with CSV fallback, then OpenCage API
  async getCityCoordinates(city: string): Promise<CityCoords> {
    const cityKey = city.trim().toLowerCase();
    
    // First check costs CSV (which also has coordinates)
    if (this.cityCostsMap.has(cityKey)) {
      const cityCosts = this.cityCostsMap.get(cityKey);
      if (cityCosts) {
        this.logger.debug(`Found city '${city}' in costs CSV`);
        return { lat: cityCosts.lat, lon: cityCosts.lon };
      }
    }
    
    // Then check coordinates CSV
    if (this.cityCoordsMap.has(cityKey)) {
      this.logger.debug(`Found city '${city}' in coordinates CSV`);
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
    if (this.GRAPHHOPPER_API_KEY) {
      try {
        const url = `https://graphhopper.com/api/1/route?point=${origin.lat},${origin.lon}&point=${destination.lat},${destination.lon}&vehicle=car&locale=en&key=${this.GRAPHHOPPER_API_KEY}&points_encoded=false`;
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

  // Fetch hotel prices from external API (Booking.com or similar)
  private async fetchHotelPricesFromAPI(city: string, country: string): Promise<number | null> {
    if (!this.RAPIDAPI_KEY) {
      this.logger.warn('RAPIDAPI_KEY not set, cannot fetch hotel prices from API');
      return null;
    }

    try {
      // Using Booking.com API via RapidAPI (example)
      const url = `https://booking-com.p.rapidapi.com/v1/hotels/search-by-coordinates`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
        },
        // Add query parameters for city search
      });

      if (response.ok) {
        const data = await response.json();
        // Process API response and extract average hotel price
        // This is a simplified example - actual implementation would depend on API structure
        if (data.result && data.result.length > 0) {
          const avgPrice = data.result.reduce((sum: number, hotel: any) => sum + (hotel.min_total_price || 0), 0) / data.result.length;
          const priceInINR = avgPrice * this.USD_TO_INR; // Convert to INR if needed
          this.logger.debug(`Hotel price for ${city} from API: ₹${priceInINR} per night`);
          return parseFloat(priceInINR.toFixed(2));
        }
      }
    } catch (error) {
      this.logger.warn(`Error fetching hotel prices from API for ${city}: ${error.message}`);
    }

    return null;
  }

  // Fetch meal costs from external API (Numbeo or similar)
  private async fetchMealCostsFromAPI(city: string, country: string): Promise<number | null> {
    if (!this.RAPIDAPI_KEY) {
      this.logger.warn('RAPIDAPI_KEY not set, cannot fetch meal costs from API');
      return null;
    }

    try {
      // Using Numbeo API via RapidAPI (example)
      const url = `https://numbeo.p.rapidapi.com/get_city_prices_by_name`;
      const response = await fetch(`${url}?name=${encodeURIComponent(city)}`, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.RAPIDAPI_KEY,
          'X-RapidAPI-Host': 'numbeo.p.rapidapi.com'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Process API response and extract meal costs
        // This is a simplified example - actual implementation would depend on API structure
        if (data.prices) {
          const mealPrice = data.prices.find((item: any) => 
            item.item_name.toLowerCase().includes('meal') || 
            item.item_name.toLowerCase().includes('restaurant')
          );
          
          if (mealPrice) {
            const dailyMealCost = mealPrice.average_price * 3; // 3 meals per day
            const priceInINR = dailyMealCost * this.USD_TO_INR; // Convert to INR if needed
            this.logger.debug(`Meal cost for ${city} from API: ₹${priceInINR} per person per day`);
            return parseFloat(priceInINR.toFixed(2));
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Error fetching meal costs from API for ${city}: ${error.message}`);
    }

    return null;
  }

  // Get country from city name with API enhancement
  private async getCityCountryFromAPI(city: string): Promise<string> {
    try {
      const coords = await this.getCityCoordinates(city);
      
      // Use reverse geocoding to get country
      if (this.OPENCAGE_KEY) {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${coords.lat}+${coords.lon}&key=${this.OPENCAGE_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const country = data.results[0].components.country;
          if (country) {
            return country.toLowerCase();
          }
        }
      }
    } catch (error) {
      this.logger.warn(`Error getting country from API for ${city}: ${error.message}`);
    }
    
    return 'unknown';
  }

  // Sophisticated travel cost calculator with mode-based pricing
  calculateTravelCost(
    distanceKm: number,
    travelers: number,
    mode: 'train' | 'bus' | 'flight',
    originCountry: string,
    destinationCountry: string,
    originCity?: string,
    destinationCity?: string,
  ): number {
    // Determine if travel is international
    const isInternational = originCountry.toLowerCase().trim() !== destinationCountry.toLowerCase().trim();
    
    // Validate mode for international travel
    if (isInternational && (mode === 'train' || mode === 'bus')) {
      throw new Error(`${mode} travel is not available for international trips. Please use flight mode.`);
    }

    // VERY REALISTIC PRICING based on actual Indian travel costs
    let costPerKm = 0;
    let overheadPerTraveler = 0;

    if (isInternational) {
      // International flight pricing - Based on actual flight costs
      if (distanceKm < 3000) {
        // Short international (e.g., India to Nepal, Sri Lanka)
        costPerKm = 4;
        overheadPerTraveler = 1500;
      } else if (distanceKm < 6000) {
        // Medium international (e.g., India to Middle East, Southeast Asia)
        costPerKm = 6;
        overheadPerTraveler = 2000;
      } else {
        // Long international (e.g., India to Europe, USA)
        costPerKm = 8;
        overheadPerTraveler = 3000;
      }
    } else {
      // Domestic travel - Real Indian pricing
      switch (mode) {
        case 'train':
          if (distanceKm < 300) {
            costPerKm = 0.5; // ₹0.5/km for short distance (Sleeper/3AC)
            overheadPerTraveler = 30;
          } else if (distanceKm < 1000) {
            costPerKm = 0.7; // ₹0.7/km for medium distance
            overheadPerTraveler = 50;
          } else {
            costPerKm = 0.9; // ₹0.9/km for long distance
            overheadPerTraveler = 80;
          }
          break;
        case 'bus':
          if (distanceKm < 300) {
            costPerKm = 0.8; // ₹0.8/km for short AC bus
            overheadPerTraveler = 20;
          } else {
            costPerKm = 1.0; // ₹1/km for long distance AC bus
            overheadPerTraveler = 40;
          }
          break;
        case 'flight':
          if (distanceKm < 500) {
            costPerKm = 4; // ₹4/km for short domestic flights
            overheadPerTraveler = 300;
          } else if (distanceKm < 1500) {
            costPerKm = 3; // ₹3/km for medium domestic flights
            overheadPerTraveler = 400;
          } else {
            costPerKm = 2.5; // ₹2.5/km for long domestic flights
            overheadPerTraveler = 500;
          }
          break;
        default:
          throw new Error(`Invalid travel mode: ${mode}`);
      }
    }

    // Minimal city surcharge - only for major expensive cities
    const expensiveCities = ['mumbai', 'delhi', 'london', 'new york', 'paris', 'tokyo', 'singapore', 'dubai'];
    let citySurcharge = 0;
    
    const originCityLower = originCity?.toLowerCase().trim() || '';
    const destinationCityLower = destinationCity?.toLowerCase().trim() || '';
    
    if (expensiveCities.some(city => originCityLower.includes(city) || destinationCityLower.includes(city))) {
      if (isInternational) {
        citySurcharge = 500; // ₹500 for international expensive cities
      } else {
        citySurcharge = 100; // ₹100 for domestic expensive cities
      }
    }

    // Calculate total cost - ONE WAY
    const oneWayDistance = distanceKm;
    
    const baseCost = costPerKm * oneWayDistance * travelers;
    const totalOverhead = overheadPerTraveler * travelers;
    const totalCitySurcharge = citySurcharge * travelers;
    
    const totalCost = baseCost + totalOverhead + totalCitySurcharge;

    this.logger.debug(`REALISTIC Travel cost calculation:
      Mode: ${mode}, Type: ${isInternational ? 'International' : 'Domestic'}
      Distance: ${distanceKm}km (one way)
      Rate: ₹${costPerKm}/km
      Base cost: ₹${baseCost} (₹${costPerKm}/km × ${oneWayDistance}km × ${travelers} travelers)
      Overhead: ₹${totalOverhead} (₹${overheadPerTraveler} × ${travelers} travelers)
      City surcharge: ₹${totalCitySurcharge}
      Total: ₹${totalCost}`);

    return parseFloat(totalCost.toFixed(2));
  }

  // Auto-select travel mode based on distance and trip type
  selectTravelMode(distanceKm: number, isInternational: boolean): 'train' | 'bus' | 'flight' {
    if (isInternational) {
      return 'flight'; // Only flight for international travel
    }

    // Domestic travel mode selection
    if (distanceKm < 200) {
      return 'bus'; // Short distance: bus preferred
    } else if (distanceKm < 800) {
      return 'train'; // Medium distance: train preferred
    } else {
      return 'flight'; // Long distance: flight preferred
    }
  }

  // Get country from city name (enhanced with API fallback)
  getCityCountry(cityName: string): string {
    const cityKey = cityName.toLowerCase().trim();
    
    // Indian cities
    const indianCities = [
      'mumbai', 'delhi', 'bangalore', 'chennai', 'kolkata', 'hyderabad', 'pune', 'ahmedabad', 
      'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'bhopal', 'patna', 'vadodara',
      'goa', 'manali', 'shimla', 'udaipur', 'rishikesh', 'darjeeling', 'gurgaon', 'noida'
    ];
    
    // International cities with their countries
    const internationalCities = {
      'new york': 'usa',
      'london': 'uk',
      'paris': 'france',
      'tokyo': 'japan',
      'singapore': 'singapore',
      'dubai': 'uae',
      'bangkok': 'thailand',
      'kuala lumpur': 'malaysia',
      'berlin': 'germany',
      'madrid': 'spain',
      'rome': 'italy',
      'amsterdam': 'netherlands',
      'barcelona': 'spain',
      'vienna': 'austria',
      'zurich': 'switzerland',
      'geneva': 'switzerland',
      'hong kong': 'china'
    };

    // Check if it's an Indian city
    if (indianCities.some(city => cityKey.includes(city))) {
      return 'india';
    }

    // Check international cities
    for (const [city, country] of Object.entries(internationalCities)) {
      if (cityKey.includes(city)) {
        return country;
      }
    }

    // Default to India if not found (assuming most queries will be India-centric)
    return 'india';
  }

  // Hotel price estimation using CSV data with API fallback
  async getHotelPrice(city: string): Promise<number> {
    const cityKey = city.trim().toLowerCase();
    
    // First try to get from CSV data
    if (this.cityCostsMap.has(cityKey)) {
      const cityCosts = this.cityCostsMap.get(cityKey);
      if (cityCosts) {
        // Use medium tier hotel pricing from CSV (converted to INR)
        const hotelPrice = cityCosts.hotelMedium;
        this.logger.debug(`Hotel price for ${city} from CSV: ₹${hotelPrice} per night`);
        return parseFloat(hotelPrice.toFixed(2));
      }
    }
    
    // Fallback to API if city not found in CSV
    this.logger.debug(`City ${city} not found in CSV, trying API for hotel pricing`);
    
    const country = this.getCityCountry(city);
    const apiPrice = await this.fetchHotelPricesFromAPI(city, country);
    
    if (apiPrice !== null) {
      return apiPrice;
    }
    
    // Final fallback - basic estimation based on country
    this.logger.debug(`API failed for ${city}, using basic country-based estimation`);
    
    if (country === 'india') {
      return 2500; // ₹2,500 per night (average for Indian cities)
    } else {
      return 8000; // ₹8,000 per night (average for international cities)
    }
  }

  // Meal cost estimation using CSV data with API fallback
  async getMealCost(city: string): Promise<number> {
    const cityKey = city.trim().toLowerCase();
    
    // First try to get from CSV data
    if (this.cityCostsMap.has(cityKey)) {
      const cityCosts = this.cityCostsMap.get(cityKey);
      if (cityCosts) {
        // Use medium tier meal pricing from CSV (converted to INR)
        const mealPrice = cityCosts.mealsMedium;
        this.logger.debug(`Meal price for ${city} from CSV: ₹${mealPrice} per person per day`);
        return parseFloat(mealPrice.toFixed(2));
      }
    }
    
    // Fallback to API if city not found in CSV
    this.logger.debug(`City ${city} not found in CSV, trying API for meal pricing`);
    
    const country = this.getCityCountry(city);
    const apiPrice = await this.fetchMealCostsFromAPI(city, country);
    
    if (apiPrice !== null) {
      return apiPrice;
    }
    
    // Final fallback - basic estimation based on country
    this.logger.debug(`API failed for ${city}, using basic country-based estimation`);
    
    if (country === 'india') {
      return 900; // ₹900 per person per day (average for Indian cities)
    } else {
      return 2000; // ₹2,000 per person per day (average for international cities)
    }
  }

  // Updated main function to estimate trip cost with Amadeus integration
  async estimateTripCost(
    originCity: string,
    destCity: string,
    days: number,
    travelers: number,
    travelMode?: 'train' | 'bus' | 'flight' | 'auto',
    originCountry?: string,
    destinationCountry?: string,
  ): Promise<{ 
    distanceKm: number; 
    travelCost: number;
    hotelCost: number; 
    mealCost: number; 
    totalCost: number;
    selectedTravelMode: string;
    tripType: string;
  }> {
    try {
      const origin = await this.getCityCoordinates(originCity);
      const destination = await this.getCityCoordinates(destCity);
  
      const distanceKm = await this.getDistanceKm(origin, destination);
      
      // Determine countries if not provided
      const originCountryFinal = originCountry || this.getCityCountry(originCity);
      const destinationCountryFinal = destinationCountry || this.getCityCountry(destCity);
      
      // Determine if trip is international
      const isInternational = originCountryFinal.toLowerCase() !== destinationCountryFinal.toLowerCase();
      const tripType = isInternational ? 'international' : 'domestic';
      
      // Auto-select travel mode if not specified or if 'auto' is selected
      let selectedMode: 'train' | 'bus' | 'flight';
      if (!travelMode || travelMode === 'auto') {
        selectedMode = this.selectTravelMode(distanceKm, isInternational);
      } else {
        selectedMode = travelMode as 'train' | 'bus' | 'flight';
      }
      
      // Calculate travel cost using Amadeus integration for flights
      const travelCost = await this.calculateTravelCostWithAmadeus(
        distanceKm, 
        travelers, 
        selectedMode, 
        originCountryFinal, 
        destinationCountryFinal,
        originCity,
        destCity
      );
      
      const hotelPricePerNight = await this.getHotelPrice(destCity);
      const mealPricePerPersonPerDay = await this.getMealCost(destCity);
  
      // Calculate total costs for all travelers and all days
      const hotelCost = parseFloat((hotelPricePerNight * days).toFixed(2)); // Hotel cost (assuming shared rooms)
      const mealCost = parseFloat((mealPricePerPersonPerDay * days * travelers).toFixed(2)); // Meal cost for all travelers
      const totalCost = parseFloat((travelCost + hotelCost + mealCost).toFixed(2));
  
      this.logger.log(`Trip cost calculated: ${originCity} to ${destCity}, ${distanceKm}km, ${tripType} ${selectedMode}, ₹${totalCost} total for ${travelers} travelers (Amadeus + CSV + API fallback)`);
  
      return {
        distanceKm,
        travelCost,
        hotelCost,
        mealCost,
        totalCost,
        selectedTravelMode: selectedMode,
        tripType,
      };
    } catch (error) {
      this.logger.error(`Error estimating trip cost: ${error.message}`);
      throw error;
    }
  }

  // Amadeus API integration for flight pricing
  private async getAmadeusToken(): Promise<string> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.amadeusToken && this.tokenExpiry && new Date() < new Date(this.tokenExpiry.getTime() - 5 * 60 * 1000)) {
      return this.amadeusToken;
    }

    if (!this.AMADEUS_CLIENT_ID || !this.AMADEUS_CLIENT_SECRET) {
      this.logger.error('Amadeus credentials not configured in environment variables');
      throw new Error('AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in environment variables');
    }

    // Try both test and production URLs
    const urls = [
      'https://test.api.amadeus.com/v1/security/oauth2/token',
      'https://api.amadeus.com/v1/security/oauth2/token'
    ];

    for (const url of urls) {
      try {
        this.logger.debug(`Attempting Amadeus authentication with ${url.includes('test') ? 'test' : 'production'} environment...`);
        
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', this.AMADEUS_CLIENT_ID);
        params.append('client_secret', this.AMADEUS_CLIENT_SECRET);

        const response = await axios.post(url, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000, // 10 second timeout
        });

        if (response.status === 200 && response.data.access_token) {
          this.amadeusToken = response.data.access_token;
          this.tokenExpiry = new Date(Date.now() + (response.data.expires_in || 1799) * 1000);
          
          this.logger.log(`✅ Successfully authenticated with Amadeus ${url.includes('test') ? 'test' : 'production'} API`);
          this.logger.debug(`Token expires at: ${this.tokenExpiry.toISOString()}`);
          
          if (!this.amadeusToken) {
            throw new Error('Received null token from Amadeus API');
          }
          return this.amadeusToken;
        }
      } catch (error) {
        this.logger.warn(`❌ Failed to authenticate with ${url.includes('test') ? 'test' : 'production'} environment: ${error.message}`);
        
        if (error.response) {
          this.logger.error(`Response status: ${error.response.status}`);
          this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
          
          // If it's an invalid client error, don't try the next URL
          if (error.response.status === 401 || error.response.data?.error === 'invalid_client') {
            this.logger.error('❌ Invalid Amadeus credentials - please check your AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET');
            break;
          }
        }
      }
    }

    throw new Error('❌ Failed to authenticate with Amadeus API in both test and production environments. Please check your credentials.');
  }

  // Get airport code for a city (simplified mapping)
  private getCityAirportCode(city: string): string {
    const cityKey = city.toLowerCase().trim();
    
    // Major airport codes mapping
    const airportCodes: { [key: string]: string } = {
      // Indian cities
      'mumbai': 'BOM',
      'delhi': 'DEL',
      'bangalore': 'BLR',
      'chennai': 'MAA',
      'kolkata': 'CCU',
      'hyderabad': 'HYD',
      'pune': 'PNQ',
      'ahmedabad': 'AMD',
      'jaipur': 'JAI',
      'goa': 'GOI',
      'kochi': 'COK',
      'trivandrum': 'TRV',
      
      // International cities
      'london': 'LHR',
      'new york': 'JFK',
      'paris': 'CDG',
      'tokyo': 'NRT',
      'singapore': 'SIN',
      'dubai': 'DXB',
      'bangkok': 'BKK',
      'kuala lumpur': 'KUL',
      'berlin': 'BER',
      'madrid': 'MAD',
      'rome': 'FCO',
      'amsterdam': 'AMS',
      'barcelona': 'BCN',
      'vienna': 'VIE',
      'zurich': 'ZUR',
      'geneva': 'GVA',
      'hong kong': 'HKG',
      'sydney': 'SYD',
      'melbourne': 'MEL',
      'toronto': 'YYZ',
      'vancouver': 'YVR',
      'los angeles': 'LAX',
      'san francisco': 'SFO',
      'chicago': 'ORD',
      'miami': 'MIA',
      'frankfurt': 'FRA',
      'munich': 'MUC',
      'istanbul': 'IST',
      'doha': 'DOH',
      'abu dhabi': 'AUH',
      'riyadh': 'RUH',
      'cairo': 'CAI',
      'johannesburg': 'JNB',
      'nairobi': 'NBO',
      'lagos': 'LOS',
      'casablanca': 'CMN'
    };

    // Try exact match first
    if (airportCodes[cityKey]) {
      return airportCodes[cityKey];
    }

    // Try partial match
    for (const [cityName, code] of Object.entries(airportCodes)) {
      if (cityKey.includes(cityName) || cityName.includes(cityKey)) {
        return code;
      }
    }

    // Default fallback - return first 3 letters uppercase
    return cityKey.substring(0, 3).toUpperCase();
  }

  // Fetch real flight prices from Amadeus API
  private async fetchFlightPricesFromAmadeus(
    originCity: string, 
    destinationCity: string, 
    travelers: number
  ): Promise<number | null> {
    try {
      const token = await this.getAmadeusToken();
      if (!token) {
        return null;
      }

      const originCode = this.getCityAirportCode(originCity);
      const destinationCode = this.getCityAirportCode(destinationCity);
      
      const departureDate = new Date();
      departureDate.setDate(departureDate.getDate() + 30);
      const formattedDate = departureDate.toISOString().split('T')[0];

      const baseUrls = [
        'https://test.api.amadeus.com/v2/shopping/flight-offers',
        'https://api.amadeus.com/v2/shopping/flight-offers'
      ];

      const currencyRates = {
        'USD': 83.0,
        'EUR': 91.0,
        'GBP': 105.0,
        'AUD': 55.0,
        'CAD': 61.0,
        'SGD': 62.0,
        'AED': 22.6,
        'THB': 2.4,
        'MYR': 18.5,
        'INR': 1.0
      };

      for (const baseUrl of baseUrls) {
        try {
          const params = {
            originLocationCode: originCode,
            destinationLocationCode: destinationCode,
            departureDate: formattedDate,
            adults: travelers.toString(),
            max: '10'
          };

          const response = await axios.get(baseUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            params,
            timeout: 15000,
          });

          if (response.data.data && response.data.data.length > 0) {
            const offers: AmadeusFlightOffer[] = response.data.data;
            const pricesInINR: number[] = [];
            
            offers.forEach((offer) => {
              const price = parseFloat(offer.price.total);
              const currency = offer.price.currency;
              const conversionRate = currencyRates[currency] || currencyRates['USD'];
              const priceInINR = currency === 'INR' ? price : price * conversionRate;
              pricesInINR.push(priceInINR);
            });
            
            const totalPriceINR = pricesInINR.reduce((sum, price) => sum + price, 0);
            const averagePriceINR = totalPriceINR / pricesInINR.length;
            
            return parseFloat(averagePriceINR.toFixed(2));
          }
        } catch (error) {
          continue;
        }
      }
    } catch (error) {
      return null;
    }

    return null;
  }

  // Enhanced travel cost calculator with Amadeus integration
  async calculateTravelCostWithAmadeus(
    distanceKm: number,
    travelers: number,
    mode: 'train' | 'bus' | 'flight',
    originCountry: string,
    destinationCountry: string,
    originCity?: string,
    destinationCity?: string,
  ): Promise<number> {
    if (mode === 'flight' && originCity && destinationCity) {
      try {
        const amadeusPrice = await this.fetchFlightPricesFromAmadeus(originCity, destinationCity, travelers);
        if (amadeusPrice !== null) {
          return amadeusPrice;
        }
      } catch (error) {
        // Fall through to calculated pricing
      }
    }

    return this.calculateTravelCost(distanceKm, travelers, mode, originCountry, destinationCountry, originCity, destinationCity);
  }

  // Test method to directly check Amadeus flight prices
  async testAmadeusFlightPrice(
    originCity: string,
    destinationCity: string,
    travelers: number
  ): Promise<string> {
    try {
      const price = await this.fetchFlightPricesFromAmadeus(originCity, destinationCity, travelers);
      
      if (price !== null) {
        return `SUCCESS: Flight price from ${originCity} to ${destinationCity} for ${travelers} travelers: ₹${price}`;
      } else {
        return `FAILED: Could not get flight price from Amadeus API.`;
      }
    } catch (error) {
      return `ERROR: ${error.message}`;
    }
  }

  // Convert AI preferences to brief cost service types
  private mapAiPreferenceToStayType(preference: AiCostPreference): StayType {
    switch (preference) {
      case AiCostPreference.BUDGET_FRIENDLY:
        return StayType.BUDGET_FRIENDLY;
      case AiCostPreference.COMFORT_STAY:
        return StayType.COMFORT_STAY;
      case AiCostPreference.LUXURY:
        return StayType.LUXURY;
      default:
        return StayType.COMFORT_STAY;
    }
  }

  private mapAiPreferenceToMealType(preference: AiMealPreference): MealType {
    switch (preference) {
      case AiMealPreference.BUDGET_FRIENDLY:
        return MealType.BUDGET_FRIENDLY;
      case AiMealPreference.CASUAL_DINING:
        return MealType.CASUAL_DINING;
      case AiMealPreference.FINE_DINING:
        return MealType.FINE_DINING;
      default:
        return MealType.CASUAL_DINING;
    }
  }

  // AI-powered hotel and meal cost estimation
  async getAiPoweredHotelAndMealCosts(
    city: string,
    accommodationPreference: AiCostPreference,
    mealPreference: AiMealPreference,
    additionalContext?: string
  ): Promise<{
    hotelCostPerNight: number;
    mealCostPerPersonPerDay: number;
    aiInsights: string;
    costMethod: string;
  }> {
    try {
      const stayType = this.mapAiPreferenceToStayType(accommodationPreference);
      const mealType = this.mapAiPreferenceToMealType(mealPreference);

      this.logger.log(`Getting AI-powered costs for ${city} - Stay: ${stayType}, Meal: ${mealType}`);

      const aiCostEstimate = await this.briefCostService.getAiDrivenCostWithContext(
        city,
        stayType,
        mealType,
        additionalContext
      );

      return {
        hotelCostPerNight: aiCostEstimate.hotelCostPerNight,
        mealCostPerPersonPerDay: aiCostEstimate.mealCostPerPersonPerDay,
        aiInsights: aiCostEstimate.briefSummary,
        costMethod: 'AI_POWERED'
      };
    } catch (error) {
      this.logger.error(`Error getting AI-powered costs for ${city}: ${error.message}`);
      
      // Fallback to existing CSV/API method
      this.logger.log(`Falling back to CSV/API method for ${city}`);
      const hotelCostPerNight = await this.getHotelPrice(city);
      const mealCostPerPersonPerDay = await this.getMealCost(city);

      return {
        hotelCostPerNight,
        mealCostPerPersonPerDay,
        aiInsights: `Cost estimate for ${city} using traditional data sources. AI estimation was unavailable.`,
        costMethod: 'CSV_FALLBACK'
      };
    }
  }

  // Enhanced trip cost estimation with AI integration
  async estimateAiEnhancedTripCost(
    originCity: string,
    destCity: string,
    days: number,
    travelers: number,
    accommodationPreference: AiCostPreference,
    mealPreference: AiMealPreference,
    travelMode?: 'train' | 'bus' | 'flight' | 'auto',
    originCountry?: string,
    destinationCountry?: string,
    additionalContext?: string
  ): Promise<{ 
    distanceKm: number; 
    travelCost: number;
    hotelCost: number; 
    mealCost: number; 
    totalCost: number;
    selectedTravelMode: string;
    tripType: string;
    aiHotelCostPerNight: number;
    aiMealCostPerPersonPerDay: number;
    aiInsights: string;
    costMethod: string;
  }> {
    try {
      const origin = await this.getCityCoordinates(originCity);
      const destination = await this.getCityCoordinates(destCity);
  
      const distanceKm = await this.getDistanceKm(origin, destination);
      
      // Determine countries if not provided
      const originCountryFinal = originCountry || this.getCityCountry(originCity);
      const destinationCountryFinal = destinationCountry || this.getCityCountry(destCity);
      
      // Determine if trip is international
      const isInternational = originCountryFinal.toLowerCase() !== destinationCountryFinal.toLowerCase();
      const tripType = isInternational ? 'international' : 'domestic';
      
      // Auto-select travel mode if not specified or if 'auto' is selected
      let selectedMode: 'train' | 'bus' | 'flight';
      if (!travelMode || travelMode === 'auto') {
        selectedMode = this.selectTravelMode(distanceKm, isInternational);
      } else {
        selectedMode = travelMode as 'train' | 'bus' | 'flight';
      }
      
      // Calculate travel cost using existing method with Amadeus integration
      const travelCost = await this.calculateTravelCostWithAmadeus(
        distanceKm, 
        travelers, 
        selectedMode, 
        originCountryFinal, 
        destinationCountryFinal,
        originCity,
        destCity
      );
      
      // Get AI-powered hotel and meal costs
      const aiCosts = await this.getAiPoweredHotelAndMealCosts(
        destCity,
        accommodationPreference,
        mealPreference,
        additionalContext
      );
  
      // Calculate total costs for all travelers and all days
      const hotelCost = parseFloat((aiCosts.hotelCostPerNight * days).toFixed(2)); // Hotel cost (assuming shared rooms)
      const mealCost = parseFloat((aiCosts.mealCostPerPersonPerDay * days * travelers).toFixed(2)); // Meal cost for all travelers
      const totalCost = parseFloat((travelCost + hotelCost + mealCost).toFixed(2));
  
      this.logger.log(`AI-Enhanced trip cost calculated: ${originCity} to ${destCity}, ${distanceKm}km, ${tripType} ${selectedMode}, ₹${totalCost} total for ${travelers} travelers (${aiCosts.costMethod})`);
  
      return {
        distanceKm,
        travelCost,
        hotelCost,
        mealCost,
        totalCost,
        selectedTravelMode: selectedMode,
        tripType,
        aiHotelCostPerNight: aiCosts.hotelCostPerNight,
        aiMealCostPerPersonPerDay: aiCosts.mealCostPerPersonPerDay,
        aiInsights: aiCosts.aiInsights,
        costMethod: aiCosts.costMethod,
      };
    } catch (error) {
      this.logger.error(`Error estimating AI-enhanced trip cost: ${error.message}`);
      throw error;
    }
  }
}
