
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface LogEntry {
  id: string;
  type: string;
  ratId?: string; // Changed from rats?: string[]
  ratName?: string; // Added for display purposes
  behavior?: string;
  weight?: number;
  temperature?: number;
  humidity?: number;
  timestamp: string;
  notes: string;
  hashtags?: string[];
  symptoms?: string[];
  medication?: string;
  dose?: string;
  food?: string;
  amount?: string;
}

// Type for the content field from Supabase
interface LogEntryContent {
  behavior?: string;
  weight?: number;
  temperature?: number;
  humidity?: number;
  notes?: string;
  tags?: string[];
  symptoms?: string[];
  medication?: string;
  dose?: string;
  food?: string;
  amount?: string;
}

export const useLogEntries = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchLogs = async () => {
    if (!user) {
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('log_entries')
        .select(`
          *,
          rats!inner(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the expected format
      const transformedLogs: LogEntry[] = data?.map(entry => {
        // Safely cast content to our expected type
        const content = (entry.content as LogEntryContent) || {};
        
        return {
          id: entry.id,
          type: entry.type,
          ratId: entry.rats?.id, // Map rat ID
          ratName: entry.rats?.name, // Map rat name for display
          behavior: content.behavior,
          weight: content.weight,
          temperature: content.temperature,
          humidity: content.humidity,
          timestamp: entry.created_at,
          notes: content.notes || '',
          hashtags: content.tags || [],
          symptoms: content.symptoms || [],
          medication: content.medication,
          dose: content.dose,
          food: content.food,
          amount: content.amount,
        };
      }) || [];

      setLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch activity logs"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addLog = async (logData: Omit<LogEntry, 'id' | 'timestamp'>) => {
    if (!user) return;

    try {
      const content: LogEntryContent = {
        behavior: logData.behavior,
        weight: logData.weight,
        temperature: logData.temperature,
        humidity: logData.humidity,
        notes: logData.notes,
        tags: logData.hashtags,
        symptoms: logData.symptoms,
        medication: logData.medication,
        dose: logData.dose,
        food: logData.food,
        amount: logData.amount,
      };

      const { data, error } = await supabase
        .from('log_entries')
        .insert({
          user_id: user.id,
          rat_id: logData.ratId || null, // Use ratId directly
          type: logData.type,
          content: content as any // Cast to any to satisfy Json type
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh logs after adding
      await fetchLogs();

      toast({
        title: t("Success"),
        description: t("Activity log added successfully"),
      });

      return data;
    } catch (error) {
      console.error('Error adding log:', error);
      toast({
        title: t("Error"),
        description: t("Failed to add activity log"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLog = async (logId: string, updates: Partial<LogEntry>) => {
    if (!user) return;

    try {
      const content: LogEntryContent = {
        behavior: updates.behavior,
        weight: updates.weight,
        temperature: updates.temperature,
        humidity: updates.humidity,
        notes: updates.notes,
        tags: updates.hashtags,
        symptoms: updates.symptoms,
        medication: updates.medication,
        dose: updates.dose,
        food: updates.food,
        amount: updates.amount,
      };

      const { error } = await supabase
        .from('log_entries')
        .update({
          content: content as any, // Cast to any to satisfy Json type
          rat_id: updates.ratId || null, // Update ratId as well
        })
        .eq('id', logId);

      if (error) throw error;

      // Refresh logs after updating
      await fetchLogs();

      toast({
        title: t("Success"),
        description: t("Activity log updated successfully"),
      });
    } catch (error) {
      console.error('Error updating log:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update activity log"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLog = async (logId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('log_entries')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      // Refresh logs after deleting
      await fetchLogs();

      toast({
        title: t("Success"),
        description: t("Activity log deleted successfully"),
      });
    } catch (error) {
      console.error('Error deleting log:', error);
      toast({
        title: t("Error"),
        description: t("Failed to delete activity log"),
        variant: "destructive",
      });
      throw error;
    }
  };
 
  useEffect(() => {
    fetchLogs();
  }, [user]);
 
  return {
    logs,
    loading,
    addLog,
    updateLog,
    deleteLog, // Add deleteLog to the returned object
    refreshLogs: fetchLogs,
  };
};
