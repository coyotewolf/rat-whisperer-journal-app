import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  icon: string;
  rat_ids?: string[];
  priority: number;
  action_needed: boolean;
}

interface HealthAlertsData {
  alerts: Alert[];
  overall_status: 'error' | 'warning' | 'info' | 'success';
  summary: string;
  cached?: boolean;
  cache_age_minutes?: number;
}

export const useHealthAlerts = () => {
  const [data, setData] = useState<HealthAlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAlerts = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data: alertsData, error: functionError } = await supabase.functions.invoke(
        'health-alerts-analysis',
        {
          body: { forceRefresh }
        }
      );

      if (functionError) {
        throw functionError;
      }

      setData(alertsData);
    } catch (err: any) {
      console.error('Failed to fetch health alerts:', err);
      setError(err.message || 'Failed to fetch health alerts');
      
      // Set fallback data
      setData({
        alerts: [{
          id: 'error',
          type: 'warning',
          title: 'Unable to Load Alerts',
          message: 'Please check your connection and try again',
          icon: 'AlertCircle',
          priority: 2,
          action_needed: false
        }],
        overall_status: 'warning',
        summary: 'Failed to load health alerts'
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchAlerts(false);
  const forceRefresh = () => {
    toast({
      title: "Refreshing Analysis",
      description: "Generating new health insights...",
    });
    fetchAlerts(true);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          fetchAlerts(false);
        } else {
          setData(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    forceRefresh
  };
};
