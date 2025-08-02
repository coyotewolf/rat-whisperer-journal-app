
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, FileText, Utensils, Activity, Heart, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BottomNav from '@/components/BottomNav';
import UnauthenticatedReportsView from '@/components/UnauthenticatedReportsView';
import DailySummaryReport from '@/components/reports/DailySummaryReport';
import FeedingEnvironmentReport from '@/components/reports/FeedingEnvironmentReport';
import BehaviorAnalysisReport from '@/components/reports/BehaviorAnalysisReport';
import HealthReport from '@/components/reports/HealthReport';
import RatHierarchyReport from '@/components/reports/RatHierarchyReport';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';

const ReportsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // If user is not authenticated, show login prompt
  if (!user) {
    return <UnauthenticatedReportsView authModalOpen={authModalOpen} setAuthModalOpen={setAuthModalOpen} />;
  }

  const reportTypes = [
    {
      id: 'daily',
      title: t('Daily Summary'),
      description: t('Today\'s activities and health overview'),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'health',
      title: t('Health Reports'),
      description: t('Health status and medical records'),
      icon: Heart,
      color: 'text-red-600'
    },
    {
      id: 'feeding',
      title: t('Feeding & Environment'),
      description: t('Food consumption and environmental conditions'),
      icon: Utensils,
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
      id: 'hierarchy',
      title: t('Hierarchy Map'),
      description: t('Social ranking based on behaviors and interactions'),
      icon: Users,
      color: 'text-yellow-600'
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
            {reportTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id} className="text-xs px-1 py-2 min-w-0">
                <div className="flex flex-col items-center gap-1 w-full">
                  <type.icon className="h-3 w-3 flex-shrink-0" />
                  <span className="hidden sm:block text-center leading-tight">{type.title}</span>
                  <span className="sm:hidden text-center leading-tight text-[10px]">
                    {type.id === 'daily' && t('Daily')}
                    {type.id === 'health' && t('Health')}
                    {type.id === 'feeding' && t('Feed')}
                    {type.id === 'behavior' && t('Behavior')}
                    {type.id === 'hierarchy' && t('Hierarchy')}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="daily">
            <DailySummaryReport selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </TabsContent>

          <TabsContent value="health">
            <HealthReport />
          </TabsContent>

          <TabsContent value="feeding">
            <FeedingEnvironmentReport />
          </TabsContent>

          <TabsContent value="behavior">
            <BehaviorAnalysisReport />
          </TabsContent>

          <TabsContent value="hierarchy">
            <RatHierarchyReport />
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default ReportsPage;
