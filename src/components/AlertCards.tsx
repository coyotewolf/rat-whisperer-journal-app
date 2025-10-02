
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

  const getAlertStyleClasses = (type: string) => { // Renamed and themed
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-700 dark:text-yellow-400';
      case 'error':
        return 'bg-destructive/20 border-destructive/30 text-destructive-foreground';
      case 'success':
        return 'bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-400';
      case 'info':
        return 'bg-primary/20 border-primary/30 text-primary-foreground';
      default:
        return 'bg-muted/20 border-border text-muted-foreground';
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
