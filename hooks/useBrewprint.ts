// hooks/useBrewprint.ts
import { useEffect, useState } from 'react';
import { BrewprintsService, Brewprint } from '@/lib/services/brewprints';

// Enhanced brewprint with related data for brewing sessions
export interface BrewprintWithRelated extends Omit<Brewprint, 'parameters'> {
  // Transform parameters to match the expected structure
  parameters: {
    coffeeAmount: number;
    waterAmount: number;
    waterTemp: number;
    grindSize?: number;
    totalTime?: number;
    ratio: number;
  };
  // Bean information (either from related bean or defaults)
  beans: {
    name: string;
    roaster: string;
  };
}

export function useBrewprint(id: string | undefined) {
  const [brewprint, setBrewprint] = useState<BrewprintWithRelated | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBrewprint() {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await BrewprintsService.getBrewprintById(id);
        
        if (!response.success || !response.data) {
          setError(response.error || 'Brewprint not found');
          setBrewprint(null);
          return;
        }

        const rawBrewprint = response.data;

        // Transform the data to match the expected structure for the brewing session
        const transformedBrewprint: BrewprintWithRelated = {
          ...rawBrewprint,
          // Ensure method is properly formatted for display
          method: rawBrewprint.method.toUpperCase() as any,
          // Transform parameters from database format to expected format
          parameters: {
            coffeeAmount: rawBrewprint.parameters.coffee_grams,
            waterAmount: rawBrewprint.parameters.water_grams,
            waterTemp: rawBrewprint.parameters.water_temp,
            grindSize: rawBrewprint.parameters.grind_setting,
            totalTime: rawBrewprint.parameters.total_time || 240, // Default 4 minutes
            ratio: rawBrewprint.parameters.ratio ? 
              parseFloat(rawBrewprint.parameters.ratio.split(':')[1]) : 
              Math.round(rawBrewprint.parameters.water_grams / rawBrewprint.parameters.coffee_grams)
          },
          // For now, use default bean info - in the future we can fetch from bean_id
          beans: {
            name: 'Default Coffee Beans',
            roaster: 'Local Roaster'
          }
        };

        setBrewprint(transformedBrewprint);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brewprint');
        setBrewprint(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBrewprint();
  }, [id]);

  return { brewprint, loading, error };
}