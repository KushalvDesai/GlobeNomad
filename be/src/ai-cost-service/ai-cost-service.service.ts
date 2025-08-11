import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { AccommodationType, MealPreference } from './dto/ai-cost-estimate.dto';

@Injectable()
export class AiCostService {
  private readonly logger = new Logger(AiCostService.name);
  private readonly GROQ_API_KEY = process.env.GROQ_API_KEY;
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly USD_TO_INR = 83; // Current USD to INR conversion rate

  // Realistic cost ranges for different accommodation types (in USD)
  private readonly HOTEL_COST_RANGES = {
    [AccommodationType.BUDGET]: { min: 15, max: 35 },
    [AccommodationType.MID_RANGE]: { min: 35, max: 80 },
    [AccommodationType.LUXURY]: { min: 80, max: 200 },
    [AccommodationType.HOSTEL]: { min: 8, max: 25 },
    [AccommodationType.BOUTIQUE]: { min: 60, max: 150 },
  };

  // Realistic meal cost ranges for different preferences (in USD)
  private readonly MEAL_COST_RANGES = {
    [MealPreference.LOCAL_STREET_FOOD]: { min: 5, max: 15 },
    [MealPreference.CASUAL_DINING]: { min: 15, max: 35 },
    [MealPreference.FINE_DINING]: { min: 35, max: 80 },
    [MealPreference.FAST_FOOD]: { min: 8, max: 20 },
    [MealPreference.VEGETARIAN]: { min: 10, max: 25 },
    [MealPreference.VEGAN]: { min: 12, max: 30 },
  };

  async getAiCostEstimate(
    destination: string,
    days: number,
    travelers: number,
    accommodationType: AccommodationType,
    mealPreference: MealPreference,
    specificRequirements?: string,
    season?: string,
  ) {
    try {
      const prompt = this.buildCostEstimationPrompt(
        destination,
        days,
        travelers,
        accommodationType,
        mealPreference,
        specificRequirements,
        season,
      );

      const response = await this.callGroqAPI(prompt);
      const aiResponse = this.parseAiResponse(response);

      // Validate and adjust costs to realistic ranges
      const validatedCosts = this.validateAndAdjustCosts(
        aiResponse.hotelCostPerNight,
        aiResponse.mealCostPerPersonPerDay,
        accommodationType,
        mealPreference,
        destination
      );

      // Convert USD to INR
      const hotelCostPerNightINR = validatedCosts.hotelCost * this.USD_TO_INR;
      const mealCostPerPersonPerDayINR = validatedCosts.mealCost * this.USD_TO_INR;

      return {
        destination,
        days,
        travelers,
        hotelCostPerNight: Math.round(hotelCostPerNightINR),
        totalHotelCost: Math.round(hotelCostPerNightINR * days),
        mealCostPerPersonPerDay: Math.round(mealCostPerPersonPerDayINR),
        totalMealCost: Math.round(mealCostPerPersonPerDayINR * travelers * days),
        totalAccommodationAndMealCost: Math.round(
          (hotelCostPerNightINR * days) + 
          (mealCostPerPersonPerDayINR * travelers * days)
        ),
        accommodationType: accommodationType,
        mealPreference: mealPreference,
        aiRecommendations: aiResponse.recommendations,
        costBreakdown: this.formatCostBreakdownINR(aiResponse.costBreakdown, hotelCostPerNightINR, mealCostPerPersonPerDayINR),
        localInsights: aiResponse.localInsights,
        currency: 'INR',
      };
    } catch (error) {
      this.logger.error('Error getting AI cost estimate:', error);
      throw new Error('Failed to get AI cost estimate');
    }
  }

  private validateAndAdjustCosts(
    hotelCost: number,
    mealCost: number,
    accommodationType: AccommodationType,
    mealPreference: MealPreference,
    destination: string
  ) {
    const hotelRange = this.HOTEL_COST_RANGES[accommodationType];
    const mealRange = this.MEAL_COST_RANGES[mealPreference];

    // Apply destination-based multipliers
    const destinationMultiplier = this.getDestinationMultiplier(destination);

    // Validate and adjust hotel cost
    let adjustedHotelCost = hotelCost;
    const adjustedHotelMin = hotelRange.min * destinationMultiplier;
    const adjustedHotelMax = hotelRange.max * destinationMultiplier;

    if (adjustedHotelCost < adjustedHotelMin || adjustedHotelCost > adjustedHotelMax) {
      // If cost is unrealistic, use a reasonable middle value
      adjustedHotelCost = (adjustedHotelMin + adjustedHotelMax) / 2;
      this.logger.warn(`Adjusted hotel cost for ${destination} from ${hotelCost} to ${adjustedHotelCost}`);
    }

    // Validate and adjust meal cost
    let adjustedMealCost = mealCost;
    const adjustedMealMin = mealRange.min * destinationMultiplier;
    const adjustedMealMax = mealRange.max * destinationMultiplier;

    if (adjustedMealCost < adjustedMealMin || adjustedMealCost > adjustedMealMax) {
      // If cost is unrealistic, use a reasonable middle value
      adjustedMealCost = (adjustedMealMin + adjustedMealMax) / 2;
      this.logger.warn(`Adjusted meal cost for ${destination} from ${mealCost} to ${adjustedMealCost}`);
    }

    return {
      hotelCost: adjustedHotelCost,
      mealCost: adjustedMealCost
    };
  }

  private getDestinationMultiplier(destination: string): number {
    const destinationLower = destination.toLowerCase();
    
    // High-cost destinations
    if (destinationLower.includes('switzerland') || destinationLower.includes('norway') || 
        destinationLower.includes('iceland') || destinationLower.includes('singapore') ||
        destinationLower.includes('monaco') || destinationLower.includes('luxembourg')) {
      return 1.8;
    }
    
    // Expensive cities
    if (destinationLower.includes('new york') || destinationLower.includes('london') || 
        destinationLower.includes('paris') || destinationLower.includes('tokyo') ||
        destinationLower.includes('dubai') || destinationLower.includes('hong kong')) {
      return 1.5;
    }
    
    // Moderate cost destinations
    if (destinationLower.includes('india') || destinationLower.includes('thailand') || 
        destinationLower.includes('vietnam') || destinationLower.includes('nepal') ||
        destinationLower.includes('sri lanka') || destinationLower.includes('indonesia')) {
      return 0.6;
    }
    
    // Low-cost destinations
    if (destinationLower.includes('bangladesh') || destinationLower.includes('cambodia') || 
        destinationLower.includes('laos') || destinationLower.includes('myanmar')) {
      return 0.4;
    }
    
    // Default multiplier for average destinations
    return 1.0;
  }

  private buildCostEstimationPrompt(
    destination: string,
    days: number,
    travelers: number,
    accommodationType: AccommodationType,
    mealPreference: MealPreference,
    specificRequirements?: string,
    season?: string,
  ): string {
    const seasonInfo = season ? ` during ${season} season` : '';
    const requirements = specificRequirements ? ` Additional requirements: ${specificRequirements}` : '';
    
    const hotelRange = this.HOTEL_COST_RANGES[accommodationType];
    const mealRange = this.MEAL_COST_RANGES[mealPreference];
    const destinationMultiplier = this.getDestinationMultiplier(destination);

    return `You are a travel cost estimation expert. Provide REALISTIC and ACCURATE cost estimates for accommodation and meals in ${destination}${seasonInfo}.

DESTINATION: ${destination}
DURATION: ${days} days
TRAVELERS: ${travelers} people
ACCOMMODATION TYPE: ${accommodationType}
MEAL PREFERENCE: ${mealPreference}${requirements}

IMPORTANT COST GUIDELINES:
- Hotel costs should be between $${Math.round(hotelRange.min * destinationMultiplier)} - $${Math.round(hotelRange.max * destinationMultiplier)} per night for ${accommodationType}
- Meal costs should be between $${Math.round(mealRange.min * destinationMultiplier)} - $${Math.round(mealRange.max * destinationMultiplier)} per person per day for ${mealPreference}
- Consider local cost of living and typical tourist expenses
- Be realistic about what travelers actually spend

REQUIRED ANALYSIS:

1. HOTEL COST PER NIGHT (in USD):
   - Research current market rates for ${accommodationType} in ${destination}
   - Consider location, amenities, and season
   - Provide a realistic cost within the specified range

2. MEAL COST PER PERSON PER DAY (in USD):
   - Include all meals: breakfast, lunch, dinner, snacks
   - Consider ${mealPreference} dining style
   - Factor in local food prices and restaurant costs

3. DETAILED BREAKDOWN:
   - Justify your cost estimates
   - Explain regional pricing factors
   - Include tips for budget optimization

4. LOCAL INSIGHTS:
   - Best value areas to stay
   - Recommended restaurants and eateries
   - Local food culture and customs
   - Money-saving strategies

5. PRACTICAL RECOMMENDATIONS:
   - Specific accommodation suggestions
   - Restaurant recommendations with price ranges
   - Local markets and food options
   - Booking tips and timing

Respond ONLY with valid JSON in this exact format:
{
  "hotelCostPerNight": [realistic number in USD within specified range],
  "mealCostPerPersonPerDay": [realistic number in USD within specified range],
  "currency": "USD",
  "costBreakdown": "detailed explanation of costs",
  "recommendations": "specific recommendations with realistic prices",
  "localInsights": "local tips and cultural information"
}

CRITICAL: Ensure costs are realistic and within the specified ranges. Do not inflate prices unnecessarily.`;
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.GROQ_API_URL,
        {
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'You are a professional travel cost estimation expert. Provide accurate, realistic cost estimates based on current market rates. Always stay within specified cost ranges and avoid inflated prices.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.2, // Lower temperature for more consistent estimates
          max_tokens: 1500,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      this.logger.error('Error calling Groq API:', error);
      throw new Error('Failed to get AI response');
    }
  }

  private parseAiResponse(aiResponse: string) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          hotelCostPerNight: parseFloat(parsedResponse.hotelCostPerNight) || 40,
          mealCostPerPersonPerDay: parseFloat(parsedResponse.mealCostPerPersonPerDay) || 20,
          currency: parsedResponse.currency || 'USD',
          costBreakdown: parsedResponse.costBreakdown || 'Cost breakdown not available',
          recommendations: parsedResponse.recommendations || 'Recommendations not available',
          localInsights: parsedResponse.localInsights || 'Local insights not available',
        };
      }
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
    }

    // Fallback parsing with more realistic defaults
    return this.fallbackParsing(aiResponse);
  }

  private fallbackParsing(aiResponse: string) {
    // Extract numbers from the response as fallback
    const hotelMatch = aiResponse.match(/hotel.*?(\d+(?:\.\d+)?)/i);
    const mealMatch = aiResponse.match(/meal.*?(\d+(?:\.\d+)?)/i);

    return {
      hotelCostPerNight: hotelMatch ? parseFloat(hotelMatch[1]) : 40,
      mealCostPerPersonPerDay: mealMatch ? parseFloat(mealMatch[1]) : 20,
      currency: 'USD',
      costBreakdown: this.extractSection(aiResponse, 'breakdown') || 'Cost breakdown not available',
      recommendations: this.extractSection(aiResponse, 'recommendation') || 'Recommendations not available',
      localInsights: this.extractSection(aiResponse, 'insight') || 'Local insights not available',
    };
  }

  private extractSection(text: string, sectionKeyword: string): string {
    const regex = new RegExp(`${sectionKeyword}[s]?:?\\s*([\\s\\S]*?)(?=\\n\\n|\\n[A-Z]|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  private formatCostBreakdownINR(originalBreakdown: string, hotelCostINR: number, mealCostINR: number): string {
    return `COST BREAKDOWN (in Indian Rupees):

🏨 ACCOMMODATION COSTS:
• Hotel cost per night: ₹${Math.round(hotelCostINR).toLocaleString('en-IN')}
• Service charges & taxes: Usually 12-18% GST included

🍽️ MEAL COSTS:
• Meal cost per person per day: ₹${Math.round(mealCostINR).toLocaleString('en-IN')}
• Breakfast: ₹${Math.round(mealCostINR * 0.25).toLocaleString('en-IN')} - ₹${Math.round(mealCostINR * 0.35).toLocaleString('en-IN')}
• Lunch: ₹${Math.round(mealCostINR * 0.35).toLocaleString('en-IN')} - ₹${Math.round(mealCostINR * 0.45).toLocaleString('en-IN')}
• Dinner: ₹${Math.round(mealCostINR * 0.35).toLocaleString('en-IN')} - ₹${Math.round(mealCostINR * 0.45).toLocaleString('en-IN')}
• Snacks & beverages: ₹${Math.round(mealCostINR * 0.15).toLocaleString('en-IN')} - ₹${Math.round(mealCostINR * 0.25).toLocaleString('en-IN')}

${originalBreakdown}

💡 MONEY-SAVING TIPS:
• Book accommodations in advance for better rates
• Consider local eateries and street food for authentic and budget-friendly meals
• Look for hotels that include complimentary breakfast
• Use food delivery apps for discounts during off-peak hours`;
  }

  // Method to get only cost data (for integration with other services)
  async getCostOnly(
    destination: string,
    days: number,
    travelers: number,
    accommodationType: AccommodationType = AccommodationType.MID_RANGE,
    mealPreference: MealPreference = MealPreference.CASUAL_DINING,
  ) {
    const estimate = await this.getAiCostEstimate(
      destination,
      days,
      travelers,
      accommodationType,
      mealPreference,
    );

    return {
      hotelCostPerNight: estimate.hotelCostPerNight,
      totalHotelCost: estimate.totalHotelCost,
      mealCostPerPersonPerDay: estimate.mealCostPerPersonPerDay,
      totalMealCost: estimate.totalMealCost,
      totalCost: estimate.totalAccommodationAndMealCost,
    };
  }

  // Helper method to format currency in INR
  formatINR(amount: number): string {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`;
  }

  // Method to get current USD to INR rate (you can enhance this to fetch live rates)
  getCurrentExchangeRate(): number {
    return this.USD_TO_INR;
  }

  // Method to get realistic cost ranges for reference
  getCostRanges() {
    return {
      hotelRanges: this.HOTEL_COST_RANGES,
      mealRanges: this.MEAL_COST_RANGES,
    };
  }
}