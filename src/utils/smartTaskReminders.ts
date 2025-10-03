import type { LogEntry } from "@/types/logEntry";
import type { Task } from "@/hooks/useTasks";
import { differenceInDays, parseISO, isAfter } from "date-fns";

export interface SmartReminder {
  id: string;
  message: string;
  type: 'task' | 'activity' | 'care';
}

interface ReminderSettings {
  feeding: number;
  water: number;
  cage_cleaning: number;
}

export const generateSmartReminders = (
  logs: LogEntry[], 
  tasks: Task[],
  t: (key: string, options?: any) => string,
  reminderSettings?: ReminderSettings
): SmartReminder[] => {
  const reminders: SmartReminder[] = [];
  const now = new Date();

  // Use custom settings or defaults
  const settings = reminderSettings || {
    feeding: 1,
    water: 3,
    cage_cleaning: 5
  };

  // Check for overdue tasks
  const overdueTasks = tasks.filter(task => 
    !task.completed && isAfter(now, parseISO(task.due_date))
  );

  if (overdueTasks.length > 0) {
    const taskTitles = overdueTasks.slice(0, 2).map(t => t.title).join(t(', '));
    reminders.push({
      id: 'overdue-tasks',
      message: overdueTasks.length === 1 
        ? t('Overdue task: {{taskTitles}}', { taskTitles })
        : t('{{count}} overdue tasks including: {{taskTitles}}', { count: overdueTasks.length, taskTitles }),
      type: 'task'
    });
  }

  // Check feeding frequency
  const feedingLogs = logs.filter(log => log.type === 'feeding');
  if (feedingLogs.length > 0) {
    const lastFeeding = parseISO(feedingLogs[0].timestamp);
    const daysSinceFeeding = differenceInDays(now, lastFeeding);
    
    if (daysSinceFeeding >= settings.feeding) {
      reminders.push({
        id: 'feeding-reminder',
        message: t('Last feeding was {{days}} day(s) ago, check food supply', { days: daysSinceFeeding }),
        type: 'care'
      });
    }
  } else if (logs.length > 0) {
    reminders.push({
      id: 'no-feeding-logs',
      message: t('No feeding records found, consider logging feeding activities'),
      type: 'care'
    });
  }

  // Check environment/cleaning frequency
  const environmentLogs = logs.filter(log => 
    log.type === 'environment' || 
    log.hashtags?.some(tag => ['cleaning', 'cage clean', 'clean'].includes(tag.toLowerCase()))
  );
  
  if (environmentLogs.length > 0) {
    const lastCleaning = parseISO(environmentLogs[0].timestamp);
    const daysSinceCleaning = differenceInDays(now, lastCleaning);
    
    if (daysSinceCleaning >= settings.cage_cleaning) {
      reminders.push({
        id: 'cleaning-reminder',
        message: t('Cage was last cleaned {{days}} day(s) ago, consider cleaning soon', { days: daysSinceCleaning }),
        type: 'care'
      });
    }
  }

  // Check water change
  const waterLogs = logs.filter(log => 
    log.hashtags?.some(tag => ['water', 'water change', 'refill water'].includes(tag.toLowerCase()))
  );
  
  if (waterLogs.length > 0) {
    const lastWater = parseISO(waterLogs[0].timestamp);
    const daysSinceWater = differenceInDays(now, lastWater);
    
    if (daysSinceWater >= settings.water) {
      reminders.push({
        id: 'water-reminder',
        message: t('Water was last changed {{days}} day(s) ago, please check water bottle', { days: daysSinceWater }),
        type: 'care'
      });
    }
  }

  // Check for upcoming high priority tasks (today or tomorrow)
  const upcomingHighPriority = tasks.filter(task => {
    if (task.completed || task.priority !== 'high') return false;
    const dueDate = parseISO(task.due_date);
    const daysUntilDue = differenceInDays(dueDate, now);
    return daysUntilDue >= 0 && daysUntilDue <= 1;
  });

  if (upcomingHighPriority.length > 0) {
    upcomingHighPriority.forEach(task => {
      const daysUntilDue = differenceInDays(parseISO(task.due_date), now);
      const timeText = daysUntilDue === 0 ? t('today') : t('tomorrow');
      reminders.push({
        id: `upcoming-${task.id}`,
        message: t('High priority task due {{time}}: {{title}}', { time: timeText, title: task.title }),
        type: 'task'
      });
    });
  }

  return reminders;
};