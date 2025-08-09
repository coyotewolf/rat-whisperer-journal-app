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

const RatHierarchyReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [openSurvey, setOpenSurvey] = useState(false);
  const [rats, setRats] = useState([]);
  const { analysis, loading, error, cached, refetch, forceRefresh } = useHierarchyAnalysis(30);
  const { shouldShowModal, dismissSurvey, lastApiCost } = useDailySurvey();
  const { markRecommendationComplete, isRecommendationCompleted, shouldReduceFrequency } = useRecommendationTracking();
  const [history, setHistory] = useState<any[]>([]);

  // Fetch rats data
  useEffect(() => {
    const fetchRats = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('rats')
        .select('*')
        .eq('user_id', user.id);
      
      if (data) {
        setRats(data);
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

  // Load rat rank history for long-term trend
  useEffect(() => {
    const loadHistory = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('rat_rank_history')
        .select('analysis_time, rat_id, rat_name, rank, dominance_score')
        .eq('user_id', user.id)
        .order('analysis_time', { ascending: true });
      if (!error && data) setHistory(data);
    };
    loadHistory();
  }, [user]);

// Removed legacy timeRange handling

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

  if (loading) {
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
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t('Analyzing behaviors...')}</span>
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
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
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
            <p className="text-sm text-muted-foreground">🧠 {analysis.analysis_summary}</p>
          </CardContent>
        </Card>
      )}

      {/* Hierarchy Chart */}
      {analysis?.rats_hierarchy && analysis.rats_hierarchy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('Hierarchy Ranking')}</CardTitle>
          </CardHeader>
          <CardContent>
            <RankChart data={analysis.rats_hierarchy} rats={rats} />
          </CardContent>
        </Card>
      )}

      {/* Long-term Trend */}
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('Historical Hierarchy Trend')}
            </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">📈 {t('See how ranks have shifted over time.')}</p>
          <HierarchyLongTermChart rats={rats} history={history} />
        </CardContent>
      </Card>

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