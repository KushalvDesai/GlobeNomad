import { Resolver, Query, Mutation, Args, Context, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TripService } from './trip.service';
import { Trip } from './schema/trip.schema';
import { CreateTripInput } from './dto/create-trip.input';
import { UpdateTripInput } from './dto/update-trip.input';
import { TripsResponse } from './dto/trips-response.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  // Queries
  @Query(() => TripsResponse)
  @UseGuards(JwtAuthGuard)
  async myTrips(
    @Context() context,
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number,
    @Args('offset', { type: () => Number, defaultValue: 0 }) offset: number,
  ): Promise<TripsResponse> {
    return this.tripService.findMyTrips(context.req.user.id, limit, offset);
  }

  @Query(() => Trip)
  @UseGuards(JwtAuthGuard)
  async trip(
    @Args('id', { type: () => ID }) id: string,
    @Context() context,
  ): Promise<Trip> {
    return this.tripService.findOne(id, context.req.user.id);
  }

  @Query(() => Trip)
  async publicTrip(
    @Args('slug') slug: string,
  ): Promise<Trip> {
    return this.tripService.findBySlug(slug);
  }

  // Mutations
  @Mutation(() => Trip)
  @UseGuards(JwtAuthGuard)
  async createTrip(
    @Args('createTripInput') createTripInput: CreateTripInput,
    @Context() context,
  ): Promise<Trip> {
    return this.tripService.create(createTripInput, context.req.user.id);
  }

  @Mutation(() => Trip)
  @UseGuards(JwtAuthGuard)
  async updateTrip(
    @Args('updateTripInput') updateTripInput: UpdateTripInput,
    @Context() context,
  ): Promise<Trip> {
    return this.tripService.update(updateTripInput, context.req.user.id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async deleteTrip(
    @Args('id', { type: () => ID }) id: string,
    @Context() context,
  ): Promise<boolean> {
    return this.tripService.remove(id, context.req.user.id);
  }

  @Mutation(() => String, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async toggleTripPublic(
    @Args('tripId', { type: () => ID }) tripId: string,
    @Args('isPublic') isPublic: boolean,
    @Context() context,
  ): Promise<string | null> {
    const result = await this.tripService.togglePublic(tripId, isPublic, context.req.user.id);
    return result.slug || null;
  }

  @Mutation(() => Trip)
  @UseGuards(JwtAuthGuard)
  async estimateTripBudget(
    @Args('tripId', { type: () => ID }) tripId: string,
    @Context() context,
  ): Promise<Trip> {
    // TODO: Integrate with Python service for budget estimation
    // For now, we'll return a mock estimate
    const mockEstimate = Math.floor(Math.random() * 5000) + 1000; // Random estimate between 1000-6000
    return this.tripService.updateBudgetEstimate(tripId, mockEstimate, context.req.user.id);
  }
}