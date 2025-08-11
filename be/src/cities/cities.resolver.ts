import { Resolver, Query } from '@nestjs/graphql';
import * as fs from 'fs';
import * as path from 'path';

@Resolver('City')
export class CitiesResolver {
  @Query(() => [String])
  getCities() {
    const csvPath = path.resolve(process.cwd(), 'mnt/data/top_travel_cities.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const cities = lines.slice(1).map(line => line.split(',')[0].trim()); // Extract city names
    return cities;  
  }
}
