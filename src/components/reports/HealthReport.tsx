
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Heart, TrendingUp, AlertTriangle, Activity, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLogEntries } from '@/hooks/useLogEntries';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, isAfter } from 'date-fns';

interface HealthReportProps {
  selectedRatId?: string;
}

const HealthReport = ({ selectedRatId }: HealthReportProps) => {
  const { t } = useTranslation();
  const { logs } = useLogEntries();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30'); // days
  const [healthStats, setHealthStats] = useState({
    weightData: [] as any[],
    symptomFrequency: [] as any[],
    medicationUsage: [] as any[],
    healthAlerts: [] as any[]
  });

  useEffect(() => {
    if (!logs) return;

    const days = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), days);
    
    // Filter logs based on time range and selected rat
    let filteredLogs = logs.filter(log => 
      isAfter(new Date(log.timestamp), cutoffDate)
    );

    if (selectedRatId) {
      filteredLogs = filteredLogs.filter(log => 
        log.ratIds?.includes(selectedRatId)
      );
    }

    // Process weight data
    const weightLogs = filteredLogs
      .filter(log => log.type === 'weight' && log.weight)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const weightData = weightLogs.map(log => ({
      date: format(new Date(log.timestamp), 'MM/dd'),
      weight: log.weight,
      ratName: log.ratNames?.[0] || '未知'
    }));

    // Process symptom frequency
    const symptomCounts: { [key: string]: number } = {};
    filteredLogs
      .filter(log => log.symptoms && log.symptoms.length > 0)
      .forEach(log => {
        log.symptoms?.forEach(symptom => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        });
      });

    const symptomFrequency = Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Process medication usage
    const medicationCounts: { [key: string]: number } = {};
    filteredLogs
      .filter(log => log.type === 'medication' && log.medication)
      .forEach(log => {
        const med = log.medication!;
        medicationCounts[med] = (medicationCounts[med] || 0) + 1;
      });

    const medicationUsage = Object.entries(medicationCounts)
      .map(([medication, count]) => ({ medication, count }));

    // Health alerts (recent symptoms or concerning patterns)
    const recentHealthLogs = filteredLogs
      .filter(log => 
        (log.symptoms && log.symptoms.length > 0) || 
        log.type === 'health'
      )
      .slice(0, 5);

    setHealthStats({
      weightData,
      symptomFrequency,
      medicationUsage,
      healthAlerts: recentHealthLogs
    });
  }, [logs, timeRange, selectedRatId]);

  const chartConfig = {
    weight: {
      label: t('Weight (g)'),
      color: 'hsl(var(--chart-1))',
    },
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className={`text-xs flex items-center gap-1 mt-1 ${
                trend > 0 ? 'text-red-600' : trend < 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                <TrendingUp className="h-3 w-3" />
                {trend > 0 ? '+' : ''}{trend}%
              </p>
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
              <Heart className="h-5 w-5 text-red-600" />
              {t('Health Reports')}
            </CardTitle>
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">{t('7 days')}</SelectItem>
                  <SelectItem value="30">{t('30 days')}</SelectItem>
                  <SelectItem value="90">{t('90 days')}</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                {t('Export')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <StatCard
              title={t('Total Health Records')}
              value={healthStats.healthAlerts.length}
              icon={Activity}
              color="text-blue-600"
            />
            <StatCard
              title={t('Medication Doses')}
              value={healthStats.medicationUsage.reduce((sum, med) => sum + med.count, 0)}
              icon={Heart}
              color="text-purple-600"
            />
          </div>

          {/* Weight Trend Chart */}
          {healthStats.weightData.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('Weight Trend')}
              </h3>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={healthStats.weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="var(--color-weight)" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Symptom Frequency */}
          {healthStats.symptomFrequency.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t('Common Symptoms')}
              </h3>
              <div className="space-y-2">
                {healthStats.symptomFrequency.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="text-sm font-medium">{item.symptom}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.count} times</span>
                      <div className="w-16 h-2 bg-red-200 rounded-full">
                        <div 
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: `${(item.count / Math.max(...healthStats.symptomFrequency.map(s => s.count))) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Health Alerts */}
          {healthStats.healthAlerts.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('Recent Health Activities')}
              </h3>
              <div className="space-y-2">
                {healthStats.healthAlerts.map((alert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={alert.symptoms?.length > 0 ? "destructive" : "secondary"}>
                        {t(alert.type)}
                      </Badge>
                      <span className="text-sm">
                        {alert.ratNames?.join(', ') || t('Multiple rats')}
                      </span>
                      {alert.symptoms && alert.symptoms.length > 0 && (
                        <div className="flex gap-1">
                          {alert.symptoms.slice(0, 2).map((symptom: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(alert.timestamp), 'MM/dd HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Data State */}
          {healthStats.healthAlerts.length === 0 && healthStats.weightData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('No health data available for the selected period')}</p>
              <p className="text-sm mt-1">{t('Start logging health activities to see reports')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthReport;
