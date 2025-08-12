import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CitiesResolver } from './cities.resolver';
import { CitiesService } from './cities.service';
import { Trip, TripSchema } from '../trip/schema/trip.schema';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
    ActivitiesModule,
  ],
  providers: [CitiesResolver, CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}