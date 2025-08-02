import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface RatHierarchyData {
  rat_name: string;
  rat_id: string;
  dominance_score: number;
  rank: number;
  dominant_behaviors: string[];
  submissive_behaviors: string[];
  analysis: string;
}

export interface HierarchyAnalysis {
  analysis_summary: string;
  rats_hierarchy: RatHierarchyData[];
  interaction_patterns: string;
  recommendations: string;
  api_cost?: string;
  model_used?: string;
}

export const useHierarchyAnalysis = (timeRange: number = 30) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState<HierarchyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const fetchAnalysis = async (force = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('hierarchy-analysis', {
        body: { timeRange, force }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.data);
      setCached(data.cached);
      
      if (data.cached) {
        console.log('Loaded hierarchy analysis from cache');
      } else {
        console.log('Generated new hierarchy analysis');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch hierarchy analysis';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchAnalysis(false);
  const forceRefresh = () => fetchAnalysis(true);

  useEffect(() => {
    if (user) {
      fetchAnalysis();
    }
  }, [user, timeRange]);

  return {
    analysis,
    loading,
    error,
    cached,
    refetch,
    forceRefresh
  };
};