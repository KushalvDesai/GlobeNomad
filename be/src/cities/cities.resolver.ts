import { Resolver, Query, Args } from '@nestjs/graphql';
import { CitiesService } from './cities.service';
import { CityWithActivities } from './dto/city-with-activities.dto';
import { ActivityFiltersInput } from '../activities/dto/activity-filters.input';
import * as fs from 'fs';
import * as path from 'path';

@Resolver('City')
export class CitiesResolver {
  constructor(private readonly citiesService: CitiesService) {}

  @Query(() => [String])
  getCities() {
    const csvPath = path.resolve(process.cwd(), 'top_travel_cities.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const cities = lines.slice(1).map(line => line.split(',')[0].trim()); // Extract city names
    return cities;  
  }

  @Query(() => CityWithActivities)
  async getCityWithActivities(
    @Args('cityName') cityName: string,
    @Args('activityFilters', { nullable: true }) activityFilters?: ActivityFiltersInput
  ): Promise<CityWithActivities> {
    return this.citiesService.getCityWithActivities(cityName, activityFilters);
  }

  @Query(() => [CityWithActivities])
  async getPopularCitiesWithActivities(
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<CityWithActivities[]> {
    return this.citiesService.getPopularCitiesWithActivities(limit);
  }
}
