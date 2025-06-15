
import { format, isToday, isTomorrow, isBefore } from "date-fns";
import type { LogEntry } from "@/hooks/useLogEntries";

export const getDateLabel = (date: Date, t: (key: string) => string) => {
  if (isToday(date)) return t("Today");
  if (isTomorrow(date)) return t("Tomorrow");
  if (isBefore(date, new Date())) return t("Overdue");
  return format(date, "MMM d");
};

export const processRecentActivities = (logs: LogEntry[], t: (key: string, options?: any) => string) => {
  return logs
    .slice(0, 3)
    .map((log) => {
      const timeDiff = Date.now() - new Date(log.timestamp).getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      let timeAgo;
      if (days > 0) {
        timeAgo = t("{{count}} day(s) ago", { count: days });
      } else if (hours > 0) {
        timeAgo = t("{{count}} hour(s) ago", { count: hours });
      } else {
        timeAgo = t('Just now');
      }

      let displayStatus;
      let behaviorTags = [];
      
      if (log.type === 'behavior' && log.hashtags && log.hashtags.length > 0) {
        // For behavior logs, use the hashtags as behavior tags
        behaviorTags = log.hashtags;
        displayStatus = null; // We'll show tags instead of status
      } else if (log.type === 'health' && log.status) {
        displayStatus = log.status;
      } else if (log.type === 'weight' && log.weight) {
        displayStatus = `${log.weight} g`;
      } else {
        displayStatus = log.status || (log.type === 'environment' ? 'completed' : 'completed');
      }

      return {
        id: log.id,
        type: log.behavior || log.type,
        rat: log.ratNames ? log.ratNames.join(', ') : t('Unknown'),
        time: timeAgo,
        status: displayStatus,
        behaviorTags: behaviorTags,
        notes: log.notes,
        ratNames: log.ratNames || [],
        hashtags: log.hashtags || [],
        weight: log.weight,
        originalLog: log
      };
    });
};
