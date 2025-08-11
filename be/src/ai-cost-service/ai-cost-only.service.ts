import { Injectable } from '@nestjs/common';
import { AiCostService } from './ai-cost-service.service';
import { AccommodationType, MealPreference } from './dto/ai-cost-estimate.dto';

export interface CostOnlyResult {
  hotelCostPerNight: number;
  totalHotelCost: number;
  mealCostPerPersonPerDay: number;
  totalMealCost: number;
  totalCost: number;
  destination: string;
  days: number;
  travelers: number;
}

@Injectable()
export class AiCostOnlyService {
  constructor(private readonly aiCostService: AiCostService) {}

  async getHotelAndMealCosts(
    destination: string,
    days: number,
    travelers: number,
    accommodationType: AccommodationType = AccommodationType.MID_RANGE,
    mealPreference: MealPreference = MealPreference.CASUAL_DINING,
  ): Promise<CostOnlyResult> {
    const costData = await this.aiCostService.getCostOnly(
      destination,
      days,
      travelers,
      accommodationType,
      mealPreference,
    );

    return {
      ...costData,
      destination,
      days,
      travelers,
    };
  }

  async getHotelCostOnly(
    destination: string,
    days: number,
    accommodationType: AccommodationType = AccommodationType.MID_RANGE,
  ): Promise<{ hotelCostPerNight: number; totalHotelCost: number }> {
    const costData = await this.aiCostService.getCostOnly(
      destination,
      days,
      1, // travelers doesn't affect hotel cost per night
      accommodationType,
      MealPreference.CASUAL_DINING, // default, won't be used
    );

    return {
      hotelCostPerNight: costData.hotelCostPerNight,
      totalHotelCost: costData.totalHotelCost,
    };
  }

  async getMealCostOnly(
    destination: string,
    days: number,
    travelers: number,
    mealPreference: MealPreference = MealPreference.CASUAL_DINING,
  ): Promise<{ mealCostPerPersonPerDay: number; totalMealCost: number }> {
    const costData = await this.aiCostService.getCostOnly(
      destination,
      days,
      travelers,
      AccommodationType.MID_RANGE, // default, won't be used
      mealPreference,
    );

    return {
      mealCostPerPersonPerDay: costData.mealCostPerPersonPerDay,
      totalMealCost: costData.totalMealCost,
    };
  }
}