import { supabase } from '@/integrations/supabase/client';
import type { LogEntry, LogEntryContent } from '@/types/logEntry';

export class LogEntryService {
  static async fetchLogs(userId: string): Promise<LogEntry[]> {
    // Step 1: Fetch log entries
    const { data: logEntriesData, error: logEntriesError } = await supabase
      .from('log_entries')
      .select(`*`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (logEntriesError) {
      console.error('Error fetching log entries:', logEntriesError);
      throw logEntriesError;
    }

    if (!logEntriesData) return [];

    // Step 2: Collect all unique rat_ids from log entries
    const allRatIds = new Set<string>();
    logEntriesData.forEach(entry => {
      if (entry.rat_ids && Array.isArray(entry.rat_ids)) {
        entry.rat_ids.forEach(id => {
          if (id) allRatIds.add(id);
        });
      }
    });

    // Step 3: Fetch rat names if there are any rat_ids
    const ratNamesMap = new Map<string, string>();
    if (allRatIds.size > 0) {
      const { data: ratsData, error: ratsError } = await supabase
        .from('rats')
        .select('id, name')
        .in('id', Array.from(allRatIds));

      if (ratsError) {
        console.error('Error fetching rat names:', ratsError);
        // Log the error and proceed. Rat names might be incomplete or default.
      }

      // Step 4: Create a map of ratId to ratName, handling missing/empty names
      if (ratsData) {
        ratsData.forEach(rat => {
          if (rat.id) {
            // Use "未命名" if name is null, undefined, or an empty/whitespace string
            const nameIsValid = rat.name && typeof rat.name === 'string' && rat.name.trim() !== '';
            ratNamesMap.set(rat.id, nameIsValid ? rat.name.trim() : '未命名');
          }
        });
      }
    }

    // Step 5: Map log entries to the LogEntry type, populating ratNames
    return logEntriesData.map(entry => {
      const content = (entry.content as LogEntryContent) || {};
      const ratIds = entry.rat_ids || [];
      const currentRatNames: string[] = [];

      if (Array.isArray(ratIds)) {
        ratIds.forEach(id => {
          // Use "未知鼠名" if an ID from log_entries.rat_ids is not found in our ratsMap
          // This could happen if a rat was deleted but its ID still exists in older logs,
          // or if there was an error fetching specific rats.
          currentRatNames.push(ratNamesMap.get(id) || '未知鼠名');
        });
      }
      
      return {
        id: entry.id,
        type: entry.type,
        ratIds: ratIds,
        ratNames: currentRatNames, // Use the populated names
        behavior: content.behavior,
        weight: content.weight,
        temperature: content.temperature,
        humidity: content.humidity,
        timestamp: entry.created_at,
        updated_at: entry.updated_at,
        notes: content.notes || '',
        hashtags: content.tags || [], // Ensure hashtags is an array, defaulting to empty
        symptoms: content.symptoms || [], // Ensure symptoms is an array, defaulting to empty
        status: content.status, // Extract status from content
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
      status: logData.status, // Include status in content for DB
    };

    const { data, error } = await supabase
      .from('log_entries')
      .insert({
        user_id: userId,
        rat_ids: logData.ratIds || [], // Only use rat_ids
        type: logData.type,
        content: content as any,
        updated_at: logData.updated_at
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
      status: updates.status, // Include status in content for DB when updating
    };

    const { error } = await supabase
      .from('log_entries')
      .update({
        content: content as any,
        rat_ids: updates.ratIds || [], // Only use rat_ids
        updated_at: updates.updated_at
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
