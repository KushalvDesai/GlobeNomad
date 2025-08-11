import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TripService } from './trip.service';
import { TripResolver } from './trip.resolver';
import { Trip, TripSchema } from './schema/trip.schema';
import { Itinerary, ItinerarySchema } from './schema/itinerary.schema';
import { CostEstimatorService } from '../cost-estimator/cost-estimator.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Trip.name, schema: TripSchema },
      { name: Itinerary.name, schema: ItinerarySchema },
    ]),
  ],
  providers: [TripResolver, TripService, CostEstimatorService],
  exports: [TripService],
})
export class TripModule {}