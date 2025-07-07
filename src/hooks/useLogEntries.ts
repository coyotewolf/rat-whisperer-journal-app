import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LogEntryService } from '@/services/logEntryService';
import { supabase } from '@/integrations/supabase/client';
import type { LogEntry } from '@/types/logEntry';
import {
  cacheLogs,
  getCachedLogs,
  enqueueLog,
  getOutboxLogs,
  clearOutboxLogs,
  enqueueLogUpdate,
  getOutboxLogUpdates,
  clearOutboxLogUpdates,
} from '@/lib/offlineDB';

export { type LogEntry } from '@/types/logEntry';

export const useLogEntries = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const syncOutbox = async () => {
    if (!navigator.onLine || !user) return;
    const queued = await getOutboxLogs();
    const updateQueued = await getOutboxLogUpdates();
    for (const item of queued) {
      try {
        const { timestamp, ...rest } = item as any;
        await LogEntryService.addLog(user.id, rest);
      } catch (err) {
        console.error('Failed to sync log', err);
      }
    }
    for (const up of updateQueued) {
      try {
        const { data: existing } = await supabase
          .from('log_entries')
          .select('created_at')
          .eq('id', up.id)
          .maybeSingle();
        if (existing && new Date(existing.created_at) > new Date(up.updated_at)) {
          console.warn('Server has newer log version for', up.id);
          continue;
        }
        await LogEntryService.updateLog(up.id, { ...up.updates, updated_at: up.updated_at });
      } catch (err) {
        console.error('Failed to sync log update', err);
      }
    }
    if (queued.length) await clearOutboxLogs();
    if (updateQueued.length) await clearOutboxLogUpdates();
  };

  const fetchLogs = async (showLoading = true) => {
    if (showLoading && !initialLoadComplete) {
      setLoading(true);
    }

    // Load cached data immediately to prevent flash
    const cached = await getCachedLogs();
    if (cached.length && !initialLoadComplete) {
      setLogs(cached);
    }

    if (!user) {
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    if (!navigator.onLine) {
      setLoading(false);
      setInitialLoadComplete(true);
      return;
    }

    try {
      await syncOutbox();
      const transformedLogs = await LogEntryService.fetchLogs(user.id);
      setLogs(transformedLogs);
      await cacheLogs(transformedLogs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch activity logs"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setInitialLoadComplete(true);
    }
  };

  const addLog = async (logData: Omit<LogEntry, 'id' | 'timestamp' | 'rat_id'>) => {
    if (!user) return;

    if (!navigator.onLine) {
      const now = new Date().toISOString();
      const offlineLog = { ...logData, timestamp: now, updated_at: now };
      await enqueueLog(offlineLog);
      setLogs(prev => [{ ...offlineLog, id: `local-${Date.now()}` }, ...prev]);
      toast({ title: t('Success'), description: t('Activity log queued offline') });
      return;
    }

    try {
      const now = new Date().toISOString();
      const data = await LogEntryService.addLog(user.id, { ...logData, updated_at: now });
      await fetchLogs();

      toast({
        title: t("Success"),
        description: t("Activity log added successfully"),
      });

      return data;
    } catch (error: any) {
      console.error('Error adding log:', error);
      if (error instanceof Error || (error && error.message)) {
        toast({
          title: t("Error"),
          description: error.message || t("Failed to add activity log"),
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const updateLog = async (logId: string, updates: Partial<Omit<LogEntry, 'rat_id'>>) => {
    if (!user) return;

    if (!navigator.onLine) {
      const updated_at = new Date().toISOString();
      await enqueueLogUpdate({ id: logId, updates, updated_at });
      setLogs(prev => prev.map(log => log.id === logId ? { ...log, ...updates, updated_at } : log));
      toast({ title: t('Success'), description: t('Log update queued offline') });
      return;
    }

    try {
      // Update local state first to prevent flickering
      setLogs(prev => prev.map(log => 
        log.id === logId ? { ...log, ...updates, updated_at: new Date().toISOString() } : log
      ));

      await LogEntryService.updateLog(logId, { ...updates, updated_at: new Date().toISOString() });

      toast({
        title: t("Success"),
        description: t("Activity log updated successfully"),
      });
    } catch (error) {
      console.error('Error updating log:', error);
      // Revert local state on error
      await fetchLogs();
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
      await LogEntryService.deleteLog(logId);
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
    if (user && user.id) {
      fetchLogs();

      const onOnline = () => {
        fetchLogs(false); // Don't show loading on reconnect
      };
      window.addEventListener('online', onOnline);

      const channel = supabase
        .channel('logs-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'log_entries' }, () => {
          fetchLogs(false); // Don't show loading on realtime updates
        })
        .subscribe();

      return () => {
        window.removeEventListener('online', onOnline);
        supabase.removeChannel(channel);
      };
    } else {
      // Clear logs when user logs out
      setLogs([]);
      setLoading(false);
      setInitialLoadComplete(true);
    }
  }, [user?.id]);
 
  return {
    logs,
    loading,
    initialLoadComplete,
    addLog,
    updateLog,
    deleteLog,
    refreshLogs: () => fetchLogs(false),
  };
};
