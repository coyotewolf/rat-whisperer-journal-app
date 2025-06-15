
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Weight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useLogEntries } from '@/hooks/useLogEntries';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, parseISO } from 'date-fns';

const WeightTrendReport = () => {
  const { t } = useTranslation();
  const { logs } = useLogEntries();
  const { user } = useAuth();
  const [selectedRat, setSelectedRat] = useState<string>('all');
  const [rats, setRats] = useState<any[]>([]);
  const [weightData, setWeightData] = useState<any[]>([]);
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

    const weightLogs = logs.filter(log => log.type === 'weight' && log.weight);
    const days = parseInt(timeRange);
    const cutoffDate = subDays(new Date(), days);

    let filteredLogs = weightLogs.filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );

    if (selectedRat !== 'all') {
      filteredLogs = filteredLogs.filter(log => 
        log.ratIds?.includes(selectedRat)
      );
    }

    // Group by date and calculate average weight per day
    const groupedData = filteredLogs.reduce((acc, log) => {
      const date = format(new Date(log.timestamp), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = { weights: [], date };
      }
      acc[date].weights.push(log.weight);
      return acc;
    }, {} as any);

    const chartData = Object.values(groupedData).map((day: any) => ({
      date: day.date,
      weight: Math.round(day.weights.reduce((a: number, b: number) => a + b, 0) / day.weights.length),
      count: day.weights.length
    })).sort((a, b) => a.date.localeCompare(b.date));

    setWeightData(chartData);
  }, [logs, selectedRat, timeRange]);

  const selectedRatName = selectedRat === 'all' 
    ? t('All Rats') 
    : rats.find(rat => rat.id === selectedRat)?.name || '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            {t('Weight Trends')}
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
        {weightData.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Weight className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground">{t('Latest Weight')}</p>
                  <p className="text-xl font-bold">
                    {weightData[weightData.length - 1]?.weight || 0}g
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-muted-foreground">{t('Trend')}</p>
                  <p className="text-xl font-bold">
                    {weightData.length > 1 
                      ? weightData[weightData.length - 1].weight - weightData[0].weight > 0 
                        ? `+${weightData[weightData.length - 1].weight - weightData[0].weight}g`
                        : `${weightData[weightData.length - 1].weight - weightData[0].weight}g`
                      : '0g'
                    }
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="h-6 w-6 mx-auto mb-2 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">#</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('Records')}</p>
                  <p className="text-xl font-bold">{weightData.length}</p>
                </CardContent>
              </Card>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(parseISO(date), 'MM/dd')}
                  />
                  <YAxis 
                    label={{ value: t('Weight (g)'), angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                    formatter={(value: any) => [`${value}g`, t('Weight')]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Weight className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>{t('No weight data available')}</p>
            <p className="text-sm mt-1">
              {t('Start logging weight measurements to see trends for')} {selectedRatName}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeightTrendReport;
