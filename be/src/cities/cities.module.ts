import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesResolver } from './cities.resolver';
import { CitiesService } from './cities.service';
import { Trip, TripSchema } from '../trip/schema/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  providers: [CitiesResolver, CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}