import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, TrendingUp, AlertCircle, RefreshCw, Loader2, Users, MessageSquare, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useHierarchyAnalysis } from '@/hooks/useHierarchyAnalysis';
import { useDailySurvey } from '@/hooks/useDailySurvey';
import { useRecommendationTracking } from '@/hooks/useRecommendationTracking';
import DailySurveyModal from '@/components/DailySurveyModal';
import RankChart from '@/components/reports/RankChart';
import HierarchyLongTermChart from '@/components/reports/HierarchyLongTermChart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import pixelRat from '@/assets/pixel-rat.png';
import { getCache, setCache } from '@/lib/cache';

const RatHierarchyReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [openSurvey, setOpenSurvey] = useState(false);
  const [rats, setRats] = useState([]);
  const { analysis, loading, error, cached, refetch, forceRefresh } = useHierarchyAnalysis(30);
  const { shouldShowModal, dismissSurvey, lastApiCost } = useDailySurvey();
  const { markRecommendationComplete, isRecommendationCompleted, shouldReduceFrequency } = useRecommendationTracking();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchRats = async () => {
      if (!user) return;

      // try cache first
      const cacheKey = `rats:${user.id}`;
      const cached = getCache<any[]>(cacheKey);
      if (cached) setRats(cached);

      const { data } = await supabase
        .from('rats')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        setRats(data);
        setCache(cacheKey, data, 1000 * 60 * 10); // 10 minutes
      }
    };

    fetchRats();
  }, [user]);

  // Refresh analysis when other parts of app request it
  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };
    window.addEventListener('refreshHierarchyAnalysis', handleRefresh);
    return () => window.removeEventListener('refreshHierarchyAnalysis', handleRefresh);
  }, [refetch]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;

      // try cache first
      const cacheKey = `rat_rank_history:${user.id}`;
      const cached = getCache<any[]>(cacheKey);
      if (cached) setHistory(cached);

      const { data, error } = await supabase
        .from('rat_rank_history')
        .select('analysis_time, rat_id, rat_name, rank, dominance_score')
        .eq('user_id', user.id)
        .order('analysis_time', { ascending: true });
      if (!error && data) {
        setHistory(data);
        setCache(cacheKey, data, 1000 * 60 * 10);
      }
    };
    loadHistory();
  }, [user]);

  // Compute filtered histories for tabs
  const now = Date.now();
  const cutoff7 = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  const cutoff30 = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const history7 = history.filter(h => h.analysis_time >= cutoff7);
  const history30 = history.filter(h => h.analysis_time >= cutoff30);


  const getDominanceColor = (score: number) => {
    if (score >= 50) return 'bg-red-500';
    if (score >= 20) return 'bg-orange-500';
    if (score >= -20) return 'bg-yellow-500';
    if (score >= -50) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getDominanceLabel = (score: number) => {
    if (score >= 50) return t('Highly Dominant');
    if (score >= 20) return t('Dominant');
    if (score >= -20) return t('Neutral');
    if (score >= -50) return t('Submissive');
    return t('Highly Submissive');
  };

  const processRecommendations = (recommendations: string | null | undefined) => {
    // Handle cases where recommendations is not a string
    if (!recommendations || typeof recommendations !== 'string') {
      return [];
    }
    
    return recommendations.split('\n').filter(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return false;
      
      // Check if this recommendation should be reduced in frequency
      if (shouldReduceFrequency(trimmedLine)) {
        return false;
      }
      
      return true;
    });
  };

  if (loading && !analysis) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('Hierarchy Map')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <img src={pixelRat} alt="rat pixel" className="h-16 w-16 pulse" style={{ imageRendering: 'pixelated' }} />
              <span className="text-sm text-muted-foreground">{t('Analyzing behaviors...')}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('Hierarchy Map')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-8 w-8" />
              <span className="ml-2">{error}</span>
            </div>
            <Button onClick={refetch} className="w-full mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('Retry Analysis')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('Hierarchy Map')}
              {cached && (
                <Badge variant="secondary" className="ml-2">
                  {t('Cached')}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setOpenSurvey(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {t('Daily Survey')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={forceRefresh}
                disabled={loading}
                aria-label={t('Refresh')}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading && (
                  <img src={pixelRat} alt="rat pixel" className="h-4 w-4 pulse" style={{ imageRendering: 'pixelated' }} />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Summary */}
      {analysis?.analysis_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('Analysis Summary')}
            </CardTitle>
            {(() => {
              const parseCost = (c?: string) => (c ? parseFloat(String(c).replace(/[^0-9.]/g, '')) || 0 : 0);
              const analysisCost = parseCost(analysis?.api_cost);
              const totalCost = analysisCost + (lastApiCost || 0);
              return (
                <div className="text-xs text-muted-foreground">
                  {t('Total API Cost')}: ${totalCost.toFixed(6)} {analysis?.model_used ? `(${analysis.model_used})` : ''}
                </div>
              );
            })()}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.analysis_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Hierarchy Chart with sub-tabs */}
      {analysis?.rats_hierarchy && analysis.rats_hierarchy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Hierarchy Ranking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Loading overlay with pixel rat */}
              {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 rounded-md">
                  <img src={pixelRat} alt="rat pixel" className="h-10 w-10 pulse" style={{ imageRendering: 'pixelated' }} />
                  <span className="mt-2 text-xs text-muted-foreground">{t('Analyzing behaviors...')}</span>
                </div>
              )}

              <Tabs defaultValue="ranking" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="ranking">{t('Ranking')}</TabsTrigger>
                  <TabsTrigger value="7d">{t('7 days')}</TabsTrigger>
                  <TabsTrigger value="30d">{t('30 days')}</TabsTrigger>
                </TabsList>
                <TabsContent value="ranking">
                  <RankChart data={analysis.rats_hierarchy} rats={rats} />
                </TabsContent>
                <TabsContent value="7d">
                  <p className="text-sm text-muted-foreground mb-3">📈 {t('Historical Hierarchy Trend')} — {t('See how ranks have shifted over time.')}</p>
                  <HierarchyLongTermChart rats={rats} history={history7} />
                </TabsContent>
                <TabsContent value="30d">
                  <p className="text-sm text-muted-foreground mb-3">📈 {t('Historical Hierarchy Trend')} — {t('See how ranks have shifted over time.')}</p>
                  <HierarchyLongTermChart rats={rats} history={history30} />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      )}



      {/* Interaction Patterns & Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {analysis?.interaction_patterns && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Interaction Patterns')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">🔍 {analysis.interaction_patterns}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('Recommendations')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const recs = processRecommendations(analysis?.recommendations);
              if (!recs || recs.length === 0) {
                return (
                  <div className="p-4 rounded-lg border bg-card text-sm text-muted-foreground">
                    🎉 {t('No special recommendations at the moment.')}<br />
                    🤖 {t("AI analysis indicates interactions have been stable recently, so there are no urgent recommendations this time. We'll keep monitoring and notify you if anything stands out.")} 🐭✨
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {recs.map((line, index) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return null;
                    const cleanLine = trimmedLine.replace(/^[•\-\*]\s*/, '');
                    const completedCount = isRecommendationCompleted(cleanLine);
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                        <span className="text-primary mt-1">•</span>
                        <div className="flex-1">
                          <div
                            className="text-sm"
                            dangerouslySetInnerHTML={{
                              __html: cleanLine
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\n/g, '<br />')
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          {completedCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {t('Completed')} {completedCount}x
                            </Badge>
                          )}
                          <Checkbox
                            id={`recommendation-${index}`}
                            checked={completedCount > 0}
                            onCheckedChange={() => markRecommendationComplete(cleanLine)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Daily Survey Modal */}
      <DailySurveyModal 
        open={shouldShowModal || openSurvey} 
        onClose={() => { setOpenSurvey(false); dismissSurvey(); }}
      />
    </div>
  );
};

export default RatHierarchyReport;