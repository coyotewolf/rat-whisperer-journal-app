
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLogEntries } from '@/hooks/useLogEntries';
import { Badge } from '@/components/ui/badge';
import { format, subDays } from 'date-fns';

const BehaviorAnalysisReport = () => {
  const { t } = useTranslation();
  const { logs } = useLogEntries();
  const [timeRange, setTimeRange] = useState('7'); // days
  const [behaviorData, setBehaviorData] = useState<any[]>([]);
  const [timePatterns, setTimePatterns] = useState<any[]>([]);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

  useEffect(() => {
    if (!logs) return;

    const days = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), days);
    
    const behaviorLogs = logs.filter(log => 
      log.type === 'behavior' && 
      new Date(log.timestamp) >= cutoffDate &&
      log.hashtags && log.hashtags.length > 0
    );

    // Count behavior tags
    const behaviorCounts = behaviorLogs.reduce((acc, log) => {
      log.hashtags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const behaviorChartData = Object.entries(behaviorCounts)
      .map(([name, value]) => ({ name: t(name), value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    setBehaviorData(behaviorChartData);

    // Analyze time patterns (by hour)
    const hourCounts = behaviorLogs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const timeData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourCounts[i] || 0,
      time: `${i.toString().padStart(2, '0')}:00`
    }));

    setTimePatterns(timeData);
  }, [logs, timeRange, t]);

  const totalBehaviors = behaviorData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              {t('Behavior Analysis')}
            </CardTitle>
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
          </div>
        </CardHeader>
        <CardContent>
          {behaviorData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">{t('Behavior Distribution')}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={behaviorData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {behaviorData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [value, t('Count')]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">{t('Top Behaviors')}</h3>
                <div className="space-y-3">
                  {behaviorData.slice(0, 6).map((behavior, index) => (
                    <div key={behavior.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{behavior.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{behavior.value}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {((behavior.value / totalBehaviors) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('No behavior data available')}</p>
              <p className="text-sm mt-1">{t('Start logging behaviors to see analysis')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {timePatterns.some(p => p.count > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t('Activity Patterns by Time')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timePatterns}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time"
                    interval={2}
                  />
                  <YAxis 
                    label={{ value: t('Activity Count'), angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(time) => `${time}`}
                    formatter={(value: any) => [value, t('Activities')]}
                  />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BehaviorAnalysisReport;
