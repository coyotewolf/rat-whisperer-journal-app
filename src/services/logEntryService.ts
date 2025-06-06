
import { supabase } from '@/integrations/supabase/client';
import type { LogEntry, LogEntryContent } from '@/types/logEntry';

export class LogEntryService {
  static async fetchLogs(userId: string): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from('log_entries')
      .select(`
        *,
        rats!inner(id, name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(entry => {
      const content = (entry.content as LogEntryContent) || {};
      const ratIds = entry.rat_ids && entry.rat_ids.length > 0 ? entry.rat_ids : (entry.rats?.id ? [entry.rats.id] : []);
      const ratNames = entry.rats ? [entry.rats.name] : [];
      
      return {
        id: entry.id,
        type: entry.type,
        ratIds: ratIds,
        ratNames: ratNames,
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
  }

  static async addLog(userId: string, logData: Omit<LogEntry, 'id' | 'timestamp'>) {
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
        user_id: userId,
        rat_id: logData.ratIds?.[0] || '',
        rat_ids: logData.ratIds || [],
        type: logData.type,
        content: content as any
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateLog(logId: string, updates: Partial<LogEntry>) {
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
        content: content as any,
        rat_id: updates.ratIds?.[0] || '',
        rat_ids: updates.ratIds || [],
      })
      .eq('id', logId);

    if (error) throw error;
  }

  static async deleteLog(logId: string) {
    const { error } = await supabase
      .from('log_entries')
      .delete()
      .eq('id', logId);

    if (error) throw error;
  }
}
