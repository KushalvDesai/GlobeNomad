import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { StayType, MealType } from './dto/brief-cost-estimate.dto';

@Injectable()
export class BriefCostService {
  private readonly logger = new Logger(BriefCostService.name);
  private readonly GROQ_API_KEY = process.env.GROQ_API_KEY;
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  private readonly USD_TO_INR = 83;

  async getBriefCostEstimate(
    destination: string,
    stayType: StayType,
    mealType: MealType,
  ) {
    try {
      const prompt = this.buildAiDrivenPrompt(destination, stayType, mealType);
      const response = await this.callGroqAPI(prompt);
      const aiResponse = this.parseAiResponse(response);

      // Convert AI response to INR with minimal validation
      const hotelCostINR = Math.round(aiResponse.hotelCost * this.USD_TO_INR);
      const mealCostINR = Math.round(aiResponse.mealCost * this.USD_TO_INR);

      return {
        destination,
        hotelCostPerNight: hotelCostINR,
        mealCostPerPersonPerDay: mealCostINR,
        stayType: stayType,
        mealType: mealType,
        briefSummary: aiResponse.aiSummary || this.generateBriefSummary(destination, hotelCostINR, mealCostINR, stayType, mealType),
      };
    } catch (error) {
      this.logger.error('Error getting AI-driven cost estimate:', error);
      throw new Error('Failed to get AI cost estimate');
    }
  }

  private buildAiDrivenPrompt(destination: string, stayType: StayType, mealType: MealType): string {
    return `You are an expert travel cost analyst with real-time knowledge of global accommodation and dining costs. Analyze the destination "${destination}" and provide accurate cost estimates.

DESTINATION ANALYSIS REQUEST:
🏨 ACCOMMODATION: ${stayType.replace('_', ' ')}
🍽️ DINING: ${mealType.replace('_', ' ')}

TASK: Provide realistic cost estimates based on your knowledge of:
- Current market rates in ${destination}
- Local cost of living
- Tourism infrastructure and pricing
- Seasonal variations and demand
- Currency exchange rates
- Local accommodation standards
- Restaurant and food service pricing

ACCOMMODATION CATEGORIES:
- Budget Friendly: Basic hotels, guesthouses, hostels with essential amenities
- Comfort Stay: Mid-range hotels with good amenities, 3-4 star properties
- Luxury: High-end hotels, resorts, 5-star properties with premium services

DINING CATEGORIES:
- Budget Friendly: Local eateries, street food, casual restaurants, food courts
- Casual Dining: Mid-range restaurants, cafes, family dining establishments
- Fine Dining: Upscale restaurants, gourmet cuisine, premium dining experiences

ANALYSIS REQUIREMENTS:
1. Research the specific destination's cost structure
2. Consider local economic factors and tourism pricing
3. Factor in accommodation standards for the requested category
4. Analyze dining costs based on local food culture and restaurant pricing
5. Provide realistic estimates that travelers would actually encounter

OUTPUT FORMAT (JSON only):
{
  "hotelCost": [realistic USD amount per night for ${stayType} in ${destination}],
  "mealCost": [realistic USD amount per person per day for ${mealType} in ${destination}],
  "aiSummary": "Brief explanation of cost factors and local insights for ${destination}"
}

IMPORTANT: Base your estimates on actual market knowledge, not arbitrary ranges. Consider what real travelers pay in ${destination} for ${stayType} accommodation and ${mealType} dining experiences.`;
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
              content: `You are a professional travel cost analyst with extensive real-world knowledge of global accommodation and dining costs. You have access to current market data and understand regional pricing variations. Provide accurate, realistic cost estimates based on actual market conditions, not theoretical ranges.

Your expertise includes:
- Current hotel and accommodation pricing across different categories
- Restaurant and food service costs in various destinations
- Local economic factors affecting tourism pricing
- Seasonal and demand-based price variations
- Currency considerations and purchasing power
- Regional cost of living differences

Always provide realistic estimates that reflect what travelers actually pay, considering local market conditions and tourism infrastructure.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3, // Slightly higher for more nuanced AI responses
          max_tokens: 300,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 20000,
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
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          hotelCost: this.validateCost(parseFloat(parsed.hotelCost), 10, 500), // Basic sanity check
          mealCost: this.validateCost(parseFloat(parsed.mealCost), 5, 200),   // Basic sanity check
          aiSummary: parsed.aiSummary || '',
        };
      }
    } catch (error) {
      this.logger.error('Error parsing AI response:', error);
    }

    // Minimal fallback - let AI handle most of the logic
    this.logger.warn('Using fallback cost estimation');
    return { 
      hotelCost: 50, 
      mealCost: 25, 
      aiSummary: 'Cost estimate based on general market analysis' 
    };
  }

  private validateCost(cost: number, min: number, max: number): number {
    // Only basic sanity checks - let AI intelligence handle most validation
    if (isNaN(cost) || cost < min) return min;
    if (cost > max) return max;
    return cost;
  }

  private generateBriefSummary(
    destination: string,
    hotelCost: number,
    mealCost: number,
    stayType: StayType,
    mealType: MealType
  ): string {
    const stayTypeText = stayType.replace('_', ' ').toLowerCase();
    const mealTypeText = mealType.replace('_', ' ').toLowerCase();
    
    return `AI Analysis: ${destination} offers ${stayTypeText} accommodation at ₹${hotelCost.toLocaleString('en-IN')} per night and ${mealTypeText} dining at ₹${mealCost.toLocaleString('en-IN')} per person daily.`;
  }

  // Enhanced method for getting AI-driven cost estimates with additional context
  async getAiDrivenCostWithContext(
    destination: string,
    stayType: StayType,
    mealType: MealType,
    additionalContext?: string
  ) {
    const contextPrompt = additionalContext 
      ? `\n\nADDITIONAL CONTEXT: ${additionalContext}`
      : '';

    const enhancedPrompt = this.buildAiDrivenPrompt(destination, stayType, mealType) + contextPrompt;
    
    try {
      const response = await this.callGroqAPI(enhancedPrompt);
      const aiResponse = this.parseAiResponse(response);

      const hotelCostINR = Math.round(aiResponse.hotelCost * this.USD_TO_INR);
      const mealCostINR = Math.round(aiResponse.mealCost * this.USD_TO_INR);

      return {
        destination,
        hotelCostPerNight: hotelCostINR,
        mealCostPerPersonPerDay: mealCostINR,
        stayType: stayType,
        mealType: mealType,
        briefSummary: aiResponse.aiSummary || this.generateBriefSummary(destination, hotelCostINR, mealCostINR, stayType, mealType),
        aiConfidence: 'high', // AI-driven estimate
      };
    } catch (error) {
      this.logger.error('Error getting enhanced AI cost estimate:', error);
      throw new Error('Failed to get enhanced AI cost estimate');
    }
  }
}