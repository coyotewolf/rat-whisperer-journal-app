
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LogEntryService } from '@/services/logEntryService';
import type { LogEntry } from '@/types/logEntry';

export { type LogEntry } from '@/types/logEntry';

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
      const transformedLogs = await LogEntryService.fetchLogs(user.id);
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

  const addLog = async (logData: Omit<LogEntry, 'id' | 'timestamp' | 'rat_id'>) => {
    if (!user) return;

    try {
      const data = await LogEntryService.addLog(user.id, logData);
      await fetchLogs();

      toast({
        title: t("Success"),
        description: t("Activity log added successfully"),
      });

      return data;
    } catch (error: any) { // Explicitly type error as any for broader checking
      console.error('Error adding log:', error);
      // Only show toast if there's a meaningful error message or it's an actual Error instance
      if (error instanceof Error || (error && error.message)) {
        toast({
          title: t("Error"),
          description: error.message || t("Failed to add activity log"),
          variant: "destructive",
        });
      }
      throw error; // Re-throw the error for upstream handling
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
