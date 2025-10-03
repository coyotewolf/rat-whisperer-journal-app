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
      case 'task': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800';
      case 'care': return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800';
      case 'activity': return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800';
      default: return 'bg-muted/50 border-border';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-blue-700 dark:text-blue-300';
      case 'care': return 'text-orange-700 dark:text-orange-300';
      case 'activity': return 'text-purple-700 dark:text-purple-300';
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