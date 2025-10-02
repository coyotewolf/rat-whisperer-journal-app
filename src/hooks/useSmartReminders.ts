import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ReminderSetting {
  id: string;
  type: string;
  enabled: boolean;
  frequency_days: number;
  priority: 'low' | 'medium' | 'high';
  custom_message: string | null;
}

interface SmartReminder {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  days_since_last: number;
  action_needed: boolean;
}

export const useSmartReminders = () => {
  const [reminders, setReminders] = useState<SmartReminder[]>([]);
  const [settings, setSettings] = useState<ReminderSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const getReminderTitle = (type: string): string => {
    const titles: Record<string, string> = {
      feeding: 'Time to Feed',
      water: 'Check Water',
      cage_cleaning: 'Cage Cleaning Due',
      litter_cleaning: 'Clean Litter Box',
      weight_check: 'Weight Check',
      health_check: 'Health Check',
      medication: 'Medication Reminder'
    };
    return titles[type] || type;
  };

  const fetchReminders = async () => {
    if (!user) {
      setReminders([]);
      setSettings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch reminder settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .eq('enabled', true);

      if (settingsError) throw settingsError;
      setSettings((settingsData || []) as ReminderSetting[]);

      // Fetch recent logs
      const { data: logs, error: logsError } = await supabase
        .from('log_entries')
        .select('type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (logsError) throw logsError;

      // Calculate reminders based on settings
      const calculatedReminders: SmartReminder[] = [];

      for (const setting of settingsData || []) {
        // Find the most recent log of this type
        const relevantLogs = logs?.filter(log => {
          if (setting.type === 'feeding') return log.type === 'feeding';
          if (setting.type === 'water') return log.type === 'feeding'; // Water often logged with feeding
          if (setting.type === 'cage_cleaning') return log.type === 'environment';
          if (setting.type === 'litter_cleaning') return log.type === 'environment';
          if (setting.type === 'weight_check') return log.type === 'weight';
          if (setting.type === 'health_check') return log.type === 'health';
          if (setting.type === 'medication') return log.type === 'medication';
          return false;
        });

        const lastLog = relevantLogs?.[0];
        const daysSinceLast = lastLog
          ? Math.floor((Date.now() - new Date(lastLog.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;

        if (daysSinceLast >= setting.frequency_days) {
          calculatedReminders.push({
            id: setting.id,
            type: setting.type,
            title: getReminderTitle(setting.type),
            message: setting.custom_message || `Last done ${daysSinceLast} days ago. Recommended frequency: every ${setting.frequency_days} days.`,
            priority: setting.priority as 'low' | 'medium' | 'high',
            days_since_last: daysSinceLast,
            action_needed: daysSinceLast > setting.frequency_days * 1.5
          });
        }
      }

      // Sort by priority and days since last
      calculatedReminders.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.days_since_last - a.days_since_last;
      });

      setReminders(calculatedReminders);
    } catch (error) {
      console.error('Error fetching smart reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  return {
    reminders,
    settings,
    loading,
    refetch: fetchReminders
  };
};
