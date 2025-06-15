
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
      if (log.type === 'health' && log.status) {
        displayStatus = log.status;
      } else if (log.type === 'weight' && log.weight) {
        displayStatus = `${log.weight} g`;
      } else {
        displayStatus = log.status || (log.type === 'environment' ? 'completed' : 'completed');
      }

      // For behavior logs, use hashtags as the primary display instead of generic type
      let displayType;
      let behaviorTags = [];
      if (log.type === 'behavior' && log.hashtags && log.hashtags.length > 0) {
        displayType = 'behavior';
        behaviorTags = log.hashtags;
      } else {
        displayType = log.behavior || log.type;
      }

      return {
        id: log.id,
        type: displayType,
        rat: log.ratNames ? log.ratNames.join(', ') : t('Unknown'),
        time: timeAgo,
        status: displayStatus,
        notes: log.notes,
        ratNames: log.ratNames || [],
        hashtags: log.hashtags || [],
        behaviorTags: behaviorTags,
        weight: log.weight,
        originalLog: log
      };
    });
};
