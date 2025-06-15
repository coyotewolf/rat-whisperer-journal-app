
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Utensils, Thermometer, Droplet, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLogEntries } from '@/hooks/useLogEntries';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, parseISO } from 'date-fns';

const FeedingEnvironmentReport = () => {
  const { t } = useTranslation();
  const { logs } = useLogEntries();
  const { user } = useAuth();
  const [selectedRat, setSelectedRat] = useState<string>('all');
  const [rats, setRats] = useState<any[]>([]);
  const [feedingData, setFeedingData] = useState<any[]>([]);
  const [environmentData, setEnvironmentData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    const fetchRats = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('rats')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
      
      if (!error && data) {
        setRats(data);
      }
    };

    fetchRats();
  }, [user]);

  useEffect(() => {
    if (!logs) return;

    const days = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), days);

    // Filter logs based on time range and selected rat
    let filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    if (selectedRat !== 'all') {
      filteredLogs = filteredLogs.filter(log => 
        log.ratIds?.includes(selectedRat)
      );
    }

    // Process feeding data
    const feedingLogs = filteredLogs.filter(log => 
      log.type === 'feeding' && log.food && log.amount
    );

    const feedingByDate = feedingLogs.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { date, totalAmount: 0, feedingCount: 0, foods: {} };
      }
      
      const amount = parseFloat(log.amount) || 0;
      acc[date].totalAmount += amount;
      acc[date].feedingCount += 1;
      
      if (log.food) {
        acc[date].foods[log.food] = (acc[date].foods[log.food] || 0) + amount;
      }
      
      return acc;
    }, {} as any);

    const feedingChartData = Object.values(feedingByDate)
      .sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Process environment data
    const environmentLogs = filteredLogs.filter(log => 
      log.type === 'environment' && (log.temperature || log.humidity)
    );

    const environmentByDate = environmentLogs.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { 
          date, 
          temperatures: [], 
          humidities: [],
          avgTemp: 0,
          avgHumidity: 0
        };
      }
      
      if (log.temperature) {
        acc[date].temperatures.push(log.temperature);
      }
      if (log.humidity) {
        acc[date].humidities.push(log.humidity);
      }
      
      return acc;
    }, {} as any);

    const environmentChartData = Object.values(environmentByDate).map((day: any) => ({
      date: day.date,
      avgTemp: day.temperatures.length > 0 
        ? Math.round(day.temperatures.reduce((a: number, b: number) => a + b, 0) / day.temperatures.length)
        : null,
      avgHumidity: day.humidities.length > 0
        ? Math.round(day.humidities.reduce((a: number, b: number) => a + b, 0) / day.humidities.length)
        : null
    })).filter((day: any) => day.avgTemp !== null || day.avgHumidity !== null)
      .sort((a, b) => a.date.localeCompare(b.date));

    setFeedingData(feedingChartData);
    setEnvironmentData(environmentChartData);
  }, [logs, selectedRat, timeRange]);

  const selectedRatName = selectedRat === 'all' 
    ? t('All Rats') 
    : rats.find(rat => rat.id === selectedRat)?.name || '';

  // Calculate feeding statistics
  const totalFeedings = feedingData.reduce((sum, day) => sum + day.feedingCount, 0);
  const avgDailyAmount = feedingData.length > 0 
    ? Math.round(feedingData.reduce((sum, day) => sum + day.totalAmount, 0) / feedingData.length)
    : 0;

  // Calculate environment statistics
  const avgTemp = environmentData.length > 0
    ? Math.round(environmentData.reduce((sum, day) => sum + (day.avgTemp || 0), 0) / environmentData.filter(day => day.avgTemp !== null).length)
    : 0;
  const avgHumidity = environmentData.length > 0
    ? Math.round(environmentData.reduce((sum, day) => sum + (day.avgHumidity || 0), 0) / environmentData.filter(day => day.avgHumidity !== null).length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-green-600" />
            {t('Feeding & Environment Reports')}
          </CardTitle>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('7 days')}</SelectItem>
                <SelectItem value="30">{t('30 days')}</SelectItem>
                <SelectItem value="90">{t('90 days')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRat} onValueChange={setSelectedRat}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('All Rats')}</SelectItem>
                {rats.map((rat) => (
                  <SelectItem key={rat.id} value={rat.id}>
                    {rat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Utensils className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm text-muted-foreground">{t('Total Feedings')}</p>
                <p className="text-xl font-bold">{totalFeedings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">{t('Avg Daily Amount')}</p>
                <p className="text-xl font-bold">{avgDailyAmount}g</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <p className="text-sm text-muted-foreground">{t('Avg Temperature')}</p>
                <p className="text-xl font-bold">{avgTemp}°C</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Droplet className="h-6 w-6 mx-auto mb-2 text-cyan-600" />
                <p className="text-sm text-muted-foreground">{t('Avg Humidity')}</p>
                <p className="text-xl font-bold">{avgHumidity}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Feeding Chart */}
          {feedingData.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                {t('Daily Food Consumption')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={feedingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                    />
                    <YAxis 
                      label={{ value: t('Amount (g)'), angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                      formatter={(value: any) => [`${value}g`, t('Total Amount')]}
                    />
                    <Bar 
                      dataKey="totalAmount" 
                      fill="#22c55e"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Environment Chart */}
          {environmentData.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                {t('Temperature & Humidity Trends')}
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={environmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                    />
                    <YAxis 
                      yAxisId="temp"
                      orientation="left"
                      label={{ value: t('Temperature (°C)'), angle: -90, position: 'insideLeft' }}
                    />
                    <YAxis 
                      yAxisId="humidity"
                      orientation="right"
                      label={{ value: t('Humidity (%)'), angle: 90, position: 'insideRight' }}
                    />
                    <Tooltip 
                      labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                      formatter={(value: any, name: string) => {
                        if (name === 'avgTemp') return [`${value}°C`, t('Temperature')];
                        if (name === 'avgHumidity') return [`${value}%`, t('Humidity')];
                        return [value, name];
                      }}
                    />
                    <Line 
                      yAxisId="temp"
                      type="monotone" 
                      dataKey="avgTemp" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                    <Line 
                      yAxisId="humidity"
                      type="monotone" 
                      dataKey="avgHumidity" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* No Data State */}
          {feedingData.length === 0 && environmentData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{t('No feeding or environment data available')}</p>
              <p className="text-sm mt-1">
                {t('Start logging feeding and environment data to see reports for')} {selectedRatName}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedingEnvironmentReport;
