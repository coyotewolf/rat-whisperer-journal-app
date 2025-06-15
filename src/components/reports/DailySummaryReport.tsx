
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Activity, Weight, Thermometer, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { useLogEntries } from '@/hooks/useLogEntries';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface DailySummaryReportProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DailySummaryReport = ({ selectedDate, onDateChange }: DailySummaryReportProps) => {
  const { t } = useTranslation();
  const { logs } = useLogEntries();
  const { user } = useAuth();
  const [dailyStats, setDailyStats] = useState({
    totalActivities: 0,
    weightEntries: 0,
    healthIssues: 0,
    behaviorEntries: 0,
    environmentEntries: 0,
    recentActivities: [] as any[]
  });

  useEffect(() => {
    if (!logs || !selectedDate) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dayLogs = logs.filter(log => 
      format(new Date(log.timestamp), 'yyyy-MM-dd') === dateStr
    );

    const stats = {
      totalActivities: dayLogs.length,
      weightEntries: dayLogs.filter(log => log.type === 'weight').length,
      healthIssues: dayLogs.filter(log => 
        log.type === 'health' || (log.symptoms && log.symptoms.length > 0)
      ).length,
      behaviorEntries: dayLogs.filter(log => log.type === 'behavior').length,
      environmentEntries: dayLogs.filter(log => log.type === 'environment').length,
      recentActivities: dayLogs.slice(0, 5)
    };

    setDailyStats(stats);
  }, [logs, selectedDate]);

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {t('Daily Summary')}
            </CardTitle>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {format(selectedDate, 'MMM dd, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && onDateChange(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              title={t('Total Activities')}
              value={dailyStats.totalActivities}
              icon={Activity}
              color="text-blue-600"
              description={t('All logged activities')}
            />
            <StatCard
              title={t('Weight Records')}
              value={dailyStats.weightEntries}
              icon={Weight}
              color="text-green-600"
              description={t('Weight measurements')}
            />
            <StatCard
              title={t('Health Issues')}
              value={dailyStats.healthIssues}
              icon={AlertCircle}
              color="text-red-600"
              description={t('Health-related entries')}
            />
            <StatCard
              title={t('Environment')}
              value={dailyStats.environmentEntries}
              icon={Thermometer}
              color="text-orange-600"
              description={t('Environment records')}
            />
          </div>

          {dailyStats.recentActivities.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">{t('Recent Activities')}</h3>
              <div className="space-y-2">
                {dailyStats.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="capitalize">
                        {t(activity.type)}
                      </Badge>
                      <span className="text-sm">
                        {activity.ratNames?.join(', ') || t('Multiple rats')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(activity.timestamp), 'HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dailyStats.totalActivities === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('No activities logged for this date')}</p>
              <p className="text-sm mt-1">{t('Start logging to see your daily summary')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailySummaryReport;
