
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

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-300 text-yellow-100';
      case 'error':
        return 'bg-red-500/20 border-red-300 text-red-100';
      case 'success':
        return 'bg-green-500/20 border-green-300 text-green-100';
      case 'info':
        return 'bg-blue-500/20 border-blue-300 text-blue-100';
      default:
        return 'bg-gray-500/20 border-gray-300 text-gray-100';
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const Icon = alert.icon;
        return (
          <Card key={alert.id} className={`backdrop-blur-md bg-white/10 border-white/20 shadow-xl ${getAlertStyles(alert.type)} border-2`}>
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
