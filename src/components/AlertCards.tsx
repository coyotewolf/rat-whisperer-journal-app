
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, TrendingDown, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  icon: React.ElementType;
}

const AlertCards = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Mock alert data - in a real app, this would analyze actual rat data
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        message: 'Pepper has been losing weight for 3 consecutive days',
        icon: TrendingDown
      },
      {
        id: '2',
        type: 'error',
        message: 'Salt showed aggressive behavior 4 times this week',
        icon: AlertTriangle
      }
    ];

    // Simulate random alerts or show success message
    const shouldShowAlerts = Math.random() > 0.5;
    
    if (shouldShowAlerts && mockAlerts.length > 0) {
      setAlerts(mockAlerts.slice(0, Math.floor(Math.random() * mockAlerts.length) + 1));
    } else {
      setAlerts([{
        id: 'success',
        type: 'success',
        message: 'Everything looks good! All your rats are healthy and happy.',
        icon: CheckCircle
      }]);
    }
  }, []);

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
        const Icon = alert.icon;
        return (
          <Card key={alert.id} className={`bg-card border-border shadow-xl ${getAlertStyleClasses(alert.type)} border-2`}> {/* Themed Card */}
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 flex-shrink-0" /> {/* Icon color will inherit from text color */}
                <p className="text-sm font-medium">{alert.message}</p> {/* Text color will inherit from text color */}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AlertCards;
