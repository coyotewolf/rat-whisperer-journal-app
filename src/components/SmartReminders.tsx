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

  const getTextColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-blue-600 dark:text-blue-400';
      case 'care': return 'text-orange-600 dark:text-orange-400';
      case 'activity': return 'text-purple-600 dark:text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {reminders.map((reminder) => {
        const Icon = getIcon(reminder.type);
        const textColor = getTextColor(reminder.type);
        
        return (
          <div key={reminder.id} className="flex items-start gap-2 text-sm">
            <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${textColor}`} />
            <p className={`${textColor} font-medium`}>{reminder.message}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SmartReminders;