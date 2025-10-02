import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, RefreshCw } from "lucide-react";
import { useSmartReminders } from "@/hooks/useSmartReminders";
import { useTranslation } from "react-i18next";

const SmartReminders = () => {
  const { reminders, loading, refetch } = useSmartReminders();
  const { t } = useTranslation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/20 border-destructive/30 text-destructive';
      case 'medium':
        return 'bg-warning/20 border-warning/30 text-warning';
      case 'low':
        return 'bg-muted/20 border-muted-foreground/30 text-muted-foreground';
      default:
        return 'bg-muted/20 border-border text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            {t('Smart Reminders')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('Loading reminders...')}</p>
        </CardContent>
      </Card>
    );
  }

  if (reminders.length === 0) {
    return (
      <Card className="bg-card border-border shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Bell className="h-5 w-5 text-primary" />
            {t('Smart Reminders')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success/20 border-success/30 border-2">
            <Bell className="h-5 w-5 text-success flex-shrink-0" />
            <p className="text-sm font-medium text-success">
              {t('All caught up! No reminders at this time.')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Bell className="h-5 w-5 text-primary" />
          {t('Smart Reminders')}
          <Badge variant="secondary" className="ml-2">
            {reminders.length}
          </Badge>
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {reminders.map((reminder) => (
          <Card
            key={reminder.id}
            className={`${getPriorityColor(reminder.priority)} border-2`}
          >
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">{t(reminder.title)}</p>
                    {reminder.action_needed && (
                      <Badge variant="destructive" className="text-xs">
                        {t('Overdue')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs opacity-90">{reminder.message}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {reminder.days_since_last}d
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartReminders;
