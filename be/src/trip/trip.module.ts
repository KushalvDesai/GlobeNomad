import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripService } from './trip.service';
import { TripResolver } from './trip.resolver';
import { Trip, TripSchema } from './schema/trip.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  providers: [TripService, TripResolver],
  exports: [TripService],
})
export class TripModule {}