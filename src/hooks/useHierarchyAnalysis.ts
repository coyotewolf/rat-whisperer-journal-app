import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import i18n from '@/i18n';

export interface RatHierarchyData {
  rat_name: string;
  rat_id: string;
  dominance_score: number;
  rank: number;
  dominant_behaviors: string[];
  submissive_behaviors: string[];
  analysis: string;
  nickname?: string;
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
  const lang = i18n.language;
  const getCacheKey = (uid: string, range: number, l: string) => `hierarchy_analysis_cache:${uid}:${range}:${l}`;

  const fetchAnalysis = async (force = false) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('hierarchy-analysis', {
        body: { timeRange, force, language: i18n.language }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setAnalysis(data.data);
      setCached(data.cached);
      
      try {
        const key = getCacheKey(user.id, timeRange, i18n.language);
        localStorage.setItem(key, JSON.stringify({ analysis: data.data, cachedAt: Date.now() }));
      } catch (e) {
        console.warn('Failed to save analysis cache', e);
      }
      
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
      // Load from local cache for instant render
      try {
        const key = getCacheKey(user.id, timeRange, lang);
        const cachedStr = localStorage.getItem(key);
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr);
          if (parsed?.analysis) {
            setAnalysis(parsed.analysis);
            setCached(true);
          }
        }
      } catch (e) {
        console.warn('Failed to parse local analysis cache', e);
      }
      // Force refresh to ensure correct language and fresh data
      fetchAnalysis(true);
    }
  }, [user, timeRange, lang]);

  return {
    analysis,
    loading,
    error,
    cached,
    refetch,
    forceRefresh
  };
};