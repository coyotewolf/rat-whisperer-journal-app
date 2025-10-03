import { Clock, AlertCircle, Heart } from "lucide-react";
import type { SmartReminder } from "@/utils/smartTaskReminders";

interface SmartRemindersProps {
  reminders: SmartReminder[];
}

const SmartReminders = ({ reminders }: SmartRemindersProps) => {
  if (reminders.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return Clock;
      case 'care': return Heart;
      case 'activity': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-50 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700';
      case 'care': return 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700';
      case 'activity': return 'bg-violet-50 dark:bg-violet-950/50 border-violet-300 dark:border-violet-700';
      default: return 'bg-muted/50 border-border';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-blue-900 dark:text-blue-100';
      case 'care': return 'text-rose-900 dark:text-rose-100';
      case 'activity': return 'text-violet-900 dark:text-violet-100';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {reminders.map((reminder) => {
        const Icon = getIcon(reminder.type);
        const textColor = getTextColor(reminder.type);
        const bgColor = getBgColor(reminder.type);
        
        return (
          <div 
            key={reminder.id} 
            className={`flex items-start gap-3 p-3 rounded-lg border ${bgColor} transition-colors`}
          >
            <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${textColor}`} />
            <p className={`${textColor} text-sm leading-relaxed`}>{reminder.message}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SmartReminders;