import { supabase } from '@/integrations/supabase/client';
import type { LogEntry, LogEntryContent } from '@/types/logEntry';

export class LogEntryService {
  static async fetchLogs(userId: string): Promise<LogEntry[]> {
    const { data, error } = await supabase
      .from('log_entries')
      .select(`
        *,
        rats!left(id, name)
      `) // Changed to left join as rat_id is removed, and rat_ids might be empty
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(entry => {
      const content = (entry.content as LogEntryContent) || {};
      // Since rat_id is removed, we only rely on rat_ids
      const ratIds = entry.rat_ids || [];
      const ratNames: string[] = [];
      const ratsDataFromEntry: any = entry.rats; // Use 'any' for easier handling of Supabase response

      // Supabase might return a single object or an array of objects for a join
      // If log_entries.rat_ids is used to join with rats table, and rat_ids can have multiple entries,
      // then entry.rats could be an array of rat objects.
      // If the join is based on a (now removed) single rat_id, it might be a single object or null.
      // Given rat_id is removed, the join `rats!left(id, name)` might behave differently
      // depending on how Supabase handles joins with array columns (rat_ids).
      // For simplicity and robustness, let's assume entry.rats could be an array or a single object.

      if (ratsDataFromEntry) {
        const ratsArray = Array.isArray(ratsDataFromEntry) ? ratsDataFromEntry : [ratsDataFromEntry];
        for (const r of ratsArray) {
          // Ensure 'r' is an object and has a 'name' property before trying to access it.
          if (r && typeof r === 'object' && r.name && typeof r.name === 'string') {
            ratNames.push(r.name);
          }
        }
      }
      
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

  static async addLog(userId: string, logData: Omit<LogEntry, 'id' | 'timestamp' | 'rat_id'>) { // Removed rat_id from Omit
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
        rat_ids: logData.ratIds || [], // Only use rat_ids
        type: logData.type,
        content: content as any
      })
      .select()
      .single();

    if (error) {
      throw error; // Let upstream handle the error
    }
    return data;
  }

  static async updateLog(logId: string, updates: Partial<Omit<LogEntry, 'rat_id'>>) { // Removed rat_id from Partial Omit
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
        rat_ids: updates.ratIds || [], // Only use rat_ids
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
