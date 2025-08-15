import { supabase } from '@/lib/supabase';
import type { Brewprint } from './brewprints';
import type { Bean } from './beans';
import type { Brewer } from './brewers';

/**
 * Analytics Service
 * 
 * Provides brewing analytics, statistics, and insights
 * Aggregates data from brewprints, beans, and equipment usage
 */

export interface BrewingStats {
  totalBrews: number;
  averageRating: number;
  favoriteMethod: string;
  totalCoffeeUsed: number; // grams
  totalWaterUsed: number; // grams
  brewingStreakDays: number;
  lastBrewDate?: string;
}

export interface MethodStats {
  method: string;
  count: number;
  averageRating: number;
  averageTime: number; // seconds
  averageRatio: number;
  successRate: number; // percentage
}

export interface BeanUsage {
  bean_id: string;
  bean_name: string;
  usage_count: number;
  average_rating: number;
  total_weight_used: number; // grams
  first_used: string;
  last_used: string;
}

export interface TimelineData {
  date: string;
  brews_count: number;
  average_rating: number;
  coffee_consumed: number; // grams
}

export interface ExtractionAnalysis {
  brewprint_id: string;
  brewprint_name: string;
  target_extraction?: number;
  actual_extraction?: number;
  extraction_difference?: number;
  tds_reading?: number;
  rating: number;
  brew_date: string;
}

export interface QualityTrends {
  period: string; // 'week', 'month', 'quarter'
  average_rating: number;
  rating_trend: 'improving' | 'declining' | 'stable';
  total_brews: number;
  consistency_score: number; // 0-100
}

export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export class AnalyticsService {

  /**
   * Get comprehensive brewing statistics
   */
  static async getBrewingStats(): Promise<ServiceResponse<BrewingStats>> {
    try {
      // Get all brewprints with actual parameters
      const { data: brewprints, error } = await supabase
        .from('brewprints')
        .select('*')
        .not('brew_date', 'is', null)
        .not('rating', 'is', null);

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const brews = brewprints || [];

      // Calculate basic stats
      const totalBrews = brews.length;
      const averageRating = brews.length > 0 
        ? brews.reduce((sum, brew) => sum + (brew.rating || 0), 0) / brews.length 
        : 0;

      // Find favorite method
      const methodCounts: Record<string, number> = {};
      brews.forEach(brew => {
        methodCounts[brew.method] = (methodCounts[brew.method] || 0) + 1;
      });
      const favoriteMethod = Object.entries(methodCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'v60';

      // Calculate total coffee and water used
      const totalCoffeeUsed = brews.reduce((sum, brew) => {
        return sum + (brew.actual_parameters?.coffee_grams || brew.parameters?.coffee_grams || 0);
      }, 0);

      const totalWaterUsed = brews.reduce((sum, brew) => {
        return sum + (brew.actual_parameters?.water_grams || brew.parameters?.water_grams || 0);
      }, 0);

      // Calculate brewing streak
      const sortedBrews = brews
        .filter(brew => brew.brew_date)
        .sort((a, b) => new Date(b.brew_date!).getTime() - new Date(a.brew_date!).getTime());

      let brewingStreakDays = 0;
      let currentDate = new Date();
      
      for (const brew of sortedBrews) {
        const brewDate = new Date(brew.brew_date!);
        const daysDiff = Math.floor((currentDate.getTime() - brewDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === brewingStreakDays) {
          brewingStreakDays++;
          currentDate = brewDate;
        } else {
          break;
        }
      }

      const lastBrewDate = sortedBrews[0]?.brew_date;

      return {
        data: {
          totalBrews,
          averageRating: Math.round(averageRating * 100) / 100,
          favoriteMethod,
          totalCoffeeUsed: Math.round(totalCoffeeUsed),
          totalWaterUsed: Math.round(totalWaterUsed),
          brewingStreakDays,
          lastBrewDate
        },
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get method-specific statistics
   */
  static async getMethodStats(): Promise<ServiceResponse<MethodStats[]>> {
    try {
      const { data: brewprints, error } = await supabase
        .from('brewprints')
        .select('*')
        .not('brew_date', 'is', null)
        .not('rating', 'is', null);

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const brews = brewprints || [];
      const methodMap: Record<string, Brewprint[]> = {};

      // Group by method
      brews.forEach(brew => {
        if (!methodMap[brew.method]) {
          methodMap[brew.method] = [];
        }
        methodMap[brew.method].push(brew);
      });

      // Calculate stats for each method
      const methodStats: MethodStats[] = Object.entries(methodMap).map(([method, methodBrews]) => {
        const count = methodBrews.length;
        const averageRating = methodBrews.reduce((sum, brew) => sum + (brew.rating || 0), 0) / count;
        
        const averageTime = methodBrews.reduce((sum, brew) => {
          return sum + (brew.actual_parameters?.total_time || brew.parameters?.total_time || 0);
        }, 0) / count;

        const ratios = methodBrews.map(brew => {
          const coffeeGrams = brew.actual_parameters?.coffee_grams || brew.parameters?.coffee_grams || 0;
          const waterGrams = brew.actual_parameters?.water_grams || brew.parameters?.water_grams || 0;
          return waterGrams > 0 ? waterGrams / coffeeGrams : 0;
        }).filter(ratio => ratio > 0);

        const averageRatio = ratios.length > 0 
          ? ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length 
          : 0;

        const successfulBrews = methodBrews.filter(brew => (brew.rating || 0) >= 4).length;
        const successRate = count > 0 ? (successfulBrews / count) * 100 : 0;

        return {
          method,
          count,
          averageRating: Math.round(averageRating * 100) / 100,
          averageTime: Math.round(averageTime),
          averageRatio: Math.round(averageRatio * 10) / 10,
          successRate: Math.round(successRate * 100) / 100
        };
      });

      // Sort by count (most used first)
      methodStats.sort((a, b) => b.count - a.count);

      return {
        data: methodStats,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get bean usage analytics
   */
  static async getBeanUsage(): Promise<ServiceResponse<BeanUsage[]>> {
    try {
      const { data: brewprints, error: brewError } = await supabase
        .from('brewprints')
        .select('bean_id, rating, brew_date, actual_parameters, parameters')
        .not('bean_id', 'is', null)
        .not('brew_date', 'is', null);

      if (brewError) {
        return {
          data: null,
          error: brewError.message,
          success: false
        };
      }

      const { data: beans, error: beanError } = await supabase
        .from('beans')
        .select('id, name');

      if (beanError) {
        return {
          data: null,
          error: beanError.message,
          success: false
        };
      }

      const beanMap = new Map(beans?.map(bean => [bean.id, bean.name]) || []);
      const usageMap: Record<string, {
        usage_count: number;
        ratings: number[];
        weights: number[];
        dates: string[];
      }> = {};

      // Aggregate usage data
      brewprints?.forEach(brew => {
        if (!brew.bean_id) return;

        if (!usageMap[brew.bean_id]) {
          usageMap[brew.bean_id] = {
            usage_count: 0,
            ratings: [],
            weights: [],
            dates: []
          };
        }

        usageMap[brew.bean_id].usage_count++;
        if (brew.rating) usageMap[brew.bean_id].ratings.push(brew.rating);
        
        const weight = brew.actual_parameters?.coffee_grams || brew.parameters?.coffee_grams || 0;
        if (weight > 0) usageMap[brew.bean_id].weights.push(weight);
        
        if (brew.brew_date) usageMap[brew.bean_id].dates.push(brew.brew_date);
      });

      // Convert to BeanUsage format
      const beanUsage: BeanUsage[] = Object.entries(usageMap).map(([beanId, data]) => {
        const sortedDates = data.dates.sort();
        const averageRating = data.ratings.length > 0
          ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length
          : 0;
        const totalWeight = data.weights.reduce((sum, weight) => sum + weight, 0);

        return {
          bean_id: beanId,
          bean_name: beanMap.get(beanId) || 'Unknown Bean',
          usage_count: data.usage_count,
          average_rating: Math.round(averageRating * 100) / 100,
          total_weight_used: Math.round(totalWeight),
          first_used: sortedDates[0] || '',
          last_used: sortedDates[sortedDates.length - 1] || ''
        };
      });

      // Sort by usage count
      beanUsage.sort((a, b) => b.usage_count - a.usage_count);

      return {
        data: beanUsage,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get brewing timeline data for charts
   */
  static async getBrewingTimeline(days = 30): Promise<ServiceResponse<TimelineData[]>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: brewprints, error } = await supabase
        .from('brewprints')
        .select('brew_date, rating, actual_parameters, parameters')
        .gte('brew_date', startDate.toISOString())
        .not('brew_date', 'is', null)
        .order('brew_date', { ascending: true });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      // Group by date
      const dateMap: Record<string, {
        brews: Brewprint[];
        ratings: number[];
        coffeeAmounts: number[];
      }> = {};

      brewprints?.forEach(brew => {
        const date = brew.brew_date!.split('T')[0]; // Get YYYY-MM-DD
        
        if (!dateMap[date]) {
          dateMap[date] = {
            brews: [],
            ratings: [],
            coffeeAmounts: []
          };
        }

        dateMap[date].brews.push(brew);
        if (brew.rating) dateMap[date].ratings.push(brew.rating);
        
        const coffeeAmount = brew.actual_parameters?.coffee_grams || brew.parameters?.coffee_grams || 0;
        if (coffeeAmount > 0) dateMap[date].coffeeAmounts.push(coffeeAmount);
      });

      // Convert to timeline format
      const timeline: TimelineData[] = Object.entries(dateMap).map(([date, data]) => ({
        date,
        brews_count: data.brews.length,
        average_rating: data.ratings.length > 0
          ? Math.round((data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length) * 100) / 100
          : 0,
        coffee_consumed: Math.round(data.coffeeAmounts.reduce((sum, amount) => sum + amount, 0))
      }));

      return {
        data: timeline,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get extraction analysis data
   */
  static async getExtractionAnalysis(): Promise<ServiceResponse<ExtractionAnalysis[]>> {
    try {
      const { data: brewprints, error } = await supabase
        .from('brewprints')
        .select('id, name, target_metrics, actual_metrics, rating, brew_date')
        .not('actual_metrics', 'is', null)
        .not('brew_date', 'is', null)
        .order('brew_date', { ascending: false });

      if (error) {
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      const extractions: ExtractionAnalysis[] = (brewprints || []).map(brew => {
        const targetExtraction = brew.target_metrics?.target_extraction;
        const actualExtraction = brew.actual_metrics?.extraction_yield;
        const extractionDifference = targetExtraction && actualExtraction
          ? actualExtraction - targetExtraction
          : undefined;

        return {
          brewprint_id: brew.id,
          brewprint_name: brew.name,
          target_extraction: targetExtraction,
          actual_extraction: actualExtraction,
          extraction_difference: extractionDifference,
          tds_reading: brew.actual_metrics?.tds,
          rating: brew.rating || 0,
          brew_date: brew.brew_date!
        };
      });

      return {
        data: extractions,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get quality trends over time
   */
  static async getQualityTrends(period: 'week' | 'month' | 'quarter' = 'month'): Promise<ServiceResponse<QualityTrends[]>> {
    try {
      const periodDays = period === 'week' ? 7 : period === 'month' ? 30 : 90;
      const numPeriods = 6; // Show last 6 periods
      
      const trends: QualityTrends[] = [];

      for (let i = 0; i < numPeriods; i++) {
        const endDate = new Date();
        endDate.setDate(endDate.getDate() - (i * periodDays));
        
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - periodDays);

        const { data: brewprints, error } = await supabase
          .from('brewprints')
          .select('rating')
          .gte('brew_date', startDate.toISOString())
          .lt('brew_date', endDate.toISOString())
          .not('rating', 'is', null);

        if (error) continue;

        const ratings = brewprints?.map(b => b.rating).filter(r => r !== null) as number[] || [];
        
        if (ratings.length === 0) {
          trends.unshift({
            period: startDate.toISOString().split('T')[0],
            average_rating: 0,
            rating_trend: 'stable',
            total_brews: 0,
            consistency_score: 0
          });
          continue;
        }

        const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
        
        // Calculate consistency (lower standard deviation = higher consistency)
        const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - averageRating, 2), 0) / ratings.length;
        const standardDeviation = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 100 - (standardDeviation * 25)); // Scale to 0-100

        trends.unshift({
          period: startDate.toISOString().split('T')[0],
          average_rating: Math.round(averageRating * 100) / 100,
          rating_trend: 'stable', // Will be calculated after all periods
          total_brews: ratings.length,
          consistency_score: Math.round(consistencyScore)
        });
      }

      // Calculate trends (comparing consecutive periods)
      for (let i = 1; i < trends.length; i++) {
        const current = trends[i].average_rating;
        const previous = trends[i - 1].average_rating;
        const difference = current - previous;

        if (difference > 0.2) {
          trends[i].rating_trend = 'improving';
        } else if (difference < -0.2) {
          trends[i].rating_trend = 'declining';
        } else {
          trends[i].rating_trend = 'stable';
        }
      }

      return {
        data: trends.filter(t => t.total_brews > 0), // Only return periods with data
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  /**
   * Get brewing insights and recommendations
   */
  static async getBrewingInsights(): Promise<ServiceResponse<string[]>> {
    try {
      const insights: string[] = [];

      // Get recent stats
      const statsResult = await this.getBrewingStats();
      const methodStatsResult = await this.getMethodStats();
      
      if (!statsResult.success || !methodStatsResult.success) {
        return {
          data: ['Unable to generate insights at this time'],
          error: null,
          success: true
        };
      }

      const stats = statsResult.data!;
      const methodStats = methodStatsResult.data!;

      // Brewing frequency insight
      if (stats.totalBrews > 0) {
        if (stats.brewingStreakDays > 7) {
          insights.push(`🔥 Great consistency! You've been brewing for ${stats.brewingStreakDays} days in a row.`);
        } else if (stats.totalBrews > 50) {
          insights.push(`☕ You're a seasoned brewer with ${stats.totalBrews} total brews!`);
        } else if (stats.totalBrews > 10) {
          insights.push(`📈 You're building great brewing habits with ${stats.totalBrews} brews logged.`);
        }
      }

      // Rating insight
      if (stats.averageRating > 4.5) {
        insights.push(`⭐ Excellent brewing! Your average rating of ${stats.averageRating} shows you've mastered your technique.`);
      } else if (stats.averageRating > 3.5) {
        insights.push(`👍 Good brewing consistency with an average rating of ${stats.averageRating}.`);
      } else if (stats.averageRating > 0) {
        insights.push(`📊 Room for improvement! Your average rating is ${stats.averageRating}. Try experimenting with different parameters.`);
      }

      // Method diversity insight
      if (methodStats.length === 1) {
        insights.push(`🎯 You're focused on ${stats.favoriteMethod} brewing. Consider trying other methods to expand your skills!`);
      } else if (methodStats.length > 3) {
        insights.push(`🌟 Great diversity! You've mastered ${methodStats.length} different brewing methods.`);
      }

      // Method-specific insights
      const bestMethod = methodStats.find(m => m.averageRating === Math.max(...methodStats.map(m => m.averageRating)));
      if (bestMethod && bestMethod.averageRating > 4) {
        insights.push(`🏆 Your ${bestMethod.method} technique is excellent with an average rating of ${bestMethod.averageRating}!`);
      }

      // Coffee consumption insight
      if (stats.totalCoffeeUsed > 1000) {
        insights.push(`☕ Coffee lover! You've used ${Math.round(stats.totalCoffeeUsed / 1000 * 10) / 10}kg of coffee beans in your brewing journey.`);
      }

      // Default insight if no specific insights
      if (insights.length === 0) {
        insights.push('Start logging your brews to get personalized insights and recommendations!');
      }

      return {
        data: insights.slice(0, 4), // Limit to 4 insights
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: ['Unable to generate insights at this time'],
        error: error instanceof Error ? error.message : null,
        success: true
      };
    }
  }
}