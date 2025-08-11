import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { Activity, ActivityCategory, CityActivityStats } from './schema/activity.schema';
import { CreateActivityInput } from './dto/create-activity.input';
import { ActivityFiltersInput } from './dto/activity-filters.input';
import { CreateActivityCategoryInput } from './dto/create-activity-category.input';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetCurrentUser } from '../auth/current-user.decorator';

@Resolver(() => Activity)
export class ActivitiesResolver {
  constructor(private readonly activitiesService: ActivitiesService) {}

  // Activity Category Queries and Mutations
  @Query(() => [ActivityCategory])
  async getActivityCategories(): Promise<ActivityCategory[]> {
    return this.activitiesService.getAllCategories();
  }

  @Query(() => ActivityCategory)
  async getActivityCategory(@Args('id', { type: () => ID }) id: string): Promise<ActivityCategory> {
    return this.activitiesService.getCategoryById(id);
  }

  @Mutation(() => ActivityCategory)
  @UseGuards(JwtAuthGuard)
  async createActivityCategory(
    @Args('createCategoryInput', { type: () => CreateActivityCategoryInput }) createCategoryInput: CreateActivityCategoryInput,
    @GetCurrentUser() user: any
  ): Promise<ActivityCategory> {
    // In a real app, you might want to restrict this to admin users
    return this.activitiesService.createCategory(createCategoryInput);
  }

  // Activity Queries
  @Query(() => [Activity])
  async getActivities(
    @Args('filters', { nullable: true, type: () => ActivityFiltersInput }) filters?: ActivityFiltersInput
  ): Promise<Activity[]> {
    return this.activitiesService.getAllActivities(filters);
  }

  @Query(() => Activity)
  async getActivity(@Args('id', { type: () => ID }) id: string): Promise<Activity> {
    return this.activitiesService.getActivityById(id);
  }

  @Query(() => [Activity])
  async getActivitiesByCity(
    @Args('city') city: string,
    @Args('filters', { nullable: true, type: () => ActivityFiltersInput }) filters?: ActivityFiltersInput
  ): Promise<Activity[]> {
    return this.activitiesService.getActivitiesByCity(city, filters);
  }

  @Query(() => [Activity])
  async getActivitiesByCountry(
    @Args('country') country: string,
    @Args('filters', { nullable: true, type: () => ActivityFiltersInput }) filters?: ActivityFiltersInput
  ): Promise<Activity[]> {
    return this.activitiesService.getActivitiesByCountry(country, filters);
  }

  @Query(() => [Activity])
  async getActivitiesByCategory(
    @Args('categoryName') categoryName: string,
    @Args('filters', { nullable: true, type: () => ActivityFiltersInput }) filters?: ActivityFiltersInput
  ): Promise<Activity[]> {
    return this.activitiesService.getActivitiesByCategory(categoryName, filters);
  }

  @Query(() => [Activity])
  async searchActivities(
    @Args('searchTerm') searchTerm: string,
    @Args('filters', { nullable: true, type: () => ActivityFiltersInput }) filters?: ActivityFiltersInput
  ): Promise<Activity[]> {
    return this.activitiesService.searchActivities(searchTerm, filters);
  }

  @Query(() => [Activity])
  async getPopularActivities(
    @Args('limit', { type: () => Number, defaultValue: 10 }) limit: number
  ): Promise<Activity[]> {
    return this.activitiesService.getPopularActivities(limit);
  }

  @Query(() => [Activity])
  async getActivitiesNearLocation(
    @Args('latitude', { type: () => Number }) latitude: number,
    @Args('longitude', { type: () => Number }) longitude: number,
    @Args('radiusKm', { type: () => Number, defaultValue: 50 }) radiusKm: number
  ): Promise<Activity[]> {
    return this.activitiesService.getActivitiesNearLocation(latitude, longitude, radiusKm);
  }

  // Activity Mutations
  @Mutation(() => Activity)
  @UseGuards(JwtAuthGuard)
  async createActivity(
    @Args('createActivityInput', { type: () => CreateActivityInput }) createActivityInput: CreateActivityInput,
    @GetCurrentUser() user: any
  ): Promise<Activity> {
    // In a real app, you might want to restrict this to admin users or verified providers
    return this.activitiesService.createActivity(createActivityInput);
  }

  // Utility Mutations
  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async seedActivities(@GetCurrentUser() user: any): Promise<string> {
    // This should be restricted to admin users in production
    await this.activitiesService.seedActivities();
    return 'Activities seeded successfully';
  }

  @Query(() => [CityActivityStats])
  async getCityActivityStats(): Promise<CityActivityStats[]> {
    return this.activitiesService.getCityActivityStats();
  }

  @Query(() => CityActivityStats)
  async getCityActivityStatsById(
    @Args('city') city: string
  ): Promise<CityActivityStats> {
    const stats = await this.activitiesService.getCityActivityStats();
    const cityStats = stats.find(stat => stat.city.toLowerCase() === city.toLowerCase());
    if (!cityStats) {
      throw new Error(`No activity stats found for city: ${city}`);
    }
    return cityStats;
  }
}