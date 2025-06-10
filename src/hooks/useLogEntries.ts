
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LogEntryService } from '@/services/logEntryService';
import type { LogEntry } from '@/types/logEntry';
import {
  cacheLogs,
  getCachedLogs,
  enqueueLog,
  getOutboxLogs,
  clearOutboxLogs,
} from '@/lib/offlineDB';

export { type LogEntry } from '@/types/logEntry';

export const useLogEntries = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const syncOutbox = async () => {
    if (!navigator.onLine || !user) return;
    const queued = await getOutboxLogs();
    for (const item of queued) {
      try {
        await LogEntryService.addLog(user.id, item);
      } catch (err) {
        console.error('Failed to sync log', err);
      }
    }
    if (queued.length) await clearOutboxLogs();
  };

  const fetchLogs = async () => {
    const cached = await getCachedLogs();
    if (cached.length) setLogs(cached);
    if (!user) {
      setLoading(false);
      return;
    }

    if (!navigator.onLine) {
      setLoading(false);
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
    }
  };

  const addLog = async (logData: Omit<LogEntry, 'id' | 'timestamp' | 'rat_id'>) => {
    if (!user) return;

    if (!navigator.onLine) {
      const offlineLog = { ...logData, timestamp: new Date().toISOString() };
      await enqueueLog(offlineLog);
      setLogs(prev => [{ ...offlineLog, id: `local-${Date.now()}` }, ...prev]);
      toast({ title: t('Success'), description: t('Activity log queued offline') });
      return;
    }

    try {
      const data = await LogEntryService.addLog(user.id, logData);
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

    try {
      await LogEntryService.updateLog(logId, updates);
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
    }
    const onOnline = () => {
      fetchLogs();
    };
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
    };
  }, [user?.id]);
 
  return {
    logs,
    loading,
    addLog,
    updateLog,
    deleteLog,
    refreshLogs: fetchLogs,
  };
};
