
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, FileText, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import DailySummaryReport from '@/components/reports/DailySummaryReport';
import WeightTrendReport from '@/components/reports/WeightTrendReport';
import BehaviorAnalysisReport from '@/components/reports/BehaviorAnalysisReport';

const ReportsPage = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const reportTypes = [
    {
      id: 'daily',
      title: t('Daily Summary'),
      description: t('Today\'s activities and health overview'),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'weight',
      title: t('Weight Trends'),
      description: t('Weight changes and growth patterns'),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      id: 'behavior',
      title: t('Behavior Analysis'),
      description: t('Activity patterns and behavioral insights'),
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      id: 'health',
      title: t('Health Reports'),
      description: t('Health status and medical records'),
      icon: FileText,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{t('Reports')}</h1>
          <Button variant="outline" size="sm">
            {t('Export All')}
          </Button>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            {reportTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs">
                <type.icon className="h-4 w-4 mr-1" />
                {type.title}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="daily">
            <DailySummaryReport selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </TabsContent>

          <TabsContent value="weight">
            <WeightTrendReport />
          </TabsContent>

          <TabsContent value="behavior">
            <BehaviorAnalysisReport />
          </TabsContent>

          <TabsContent value="health">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  {t('Health Reports')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{t('Health reporting features coming soon...')}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportsPage;
