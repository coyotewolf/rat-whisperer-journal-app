
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, TrendingDown, AlertCircle, Info } from "lucide-react";
import type { LogEntry } from "@/types/logEntry";
import { analyzeHealthAlerts } from "@/utils/healthAnalysis";
import { useTranslation } from "react-i18next";

interface AlertCardsProps {
  logs: LogEntry[];
}

const AlertCards = ({ logs }: AlertCardsProps) => {
  const { t } = useTranslation();
  const alerts = analyzeHealthAlerts(logs, t);

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'error': return AlertCircle;
      case 'success': return CheckCircle;
      case 'info': return Info;
      default: return Info;
    }
  };

  const getAlertStyleClasses = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/50 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100';
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100';
      case 'info':
        return 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-900 dark:text-sky-100';
      default:
        return 'bg-muted/50 border-border text-foreground';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = getIcon(alert.type);
        return (
          <Card key={alert.id} className={`bg-card border-border shadow-xl ${getAlertStyleClasses(alert.type)} border-2`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AlertCards;
