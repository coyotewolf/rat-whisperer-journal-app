
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, TrendingDown, AlertCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useHealthAlerts } from "@/hooks/useHealthAlerts";
import { useTranslation } from "react-i18next";

const AlertCards = () => {
  const { data, loading, forceRefresh } = useHealthAlerts();
  const { t } = useTranslation();

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return AlertTriangle;
      case 'TrendingDown':
        return TrendingDown;
      case 'AlertCircle':
        return AlertCircle;
      case 'CheckCircle':
        return CheckCircle;
      case 'Info':
        return Info;
      default:
        return AlertCircle;
    }
  };

  const getAlertStyleClasses = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-warning/20 border-warning/30 text-warning';
      case 'error':
        return 'bg-destructive/20 border-destructive/30 text-destructive';
      case 'success':
        return 'bg-success/20 border-success/30 text-success';
      case 'info':
        return 'bg-info/20 border-info/30 text-info';
      default:
        return 'bg-muted/20 border-border text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="bg-card border-border shadow-xl">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">{t('Analyzing health data...')}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.alerts || data.alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{t('Health Alerts')}</h3>
          {data.cached && (
            <Badge variant="outline" className="text-xs">
              {t('Cached')} • {data.cache_age_minutes}m
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={forceRefresh}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {data.alerts.map((alert) => {
        const Icon = getIconComponent(alert.icon);
        return (
          <Card key={alert.id} className={`${getAlertStyleClasses(alert.type)} border-2 shadow-lg`}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    {alert.action_needed && (
                      <Badge variant="destructive" className="text-xs">
                        {t('Action Needed')}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{alert.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {data.summary && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {data.summary}
        </p>
      )}
    </div>
  );
};

export default AlertCards;
