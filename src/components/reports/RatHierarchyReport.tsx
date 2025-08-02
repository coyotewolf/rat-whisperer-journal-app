import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown, TrendingUp, AlertCircle, RefreshCw, Loader2, Users, MessageSquare, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useHierarchyAnalysis } from '@/hooks/useHierarchyAnalysis';
import { useDailySurvey } from '@/hooks/useDailySurvey';
import { useRecommendationTracking } from '@/hooks/useRecommendationTracking';
import DailySurveyModal from '@/components/DailySurveyModal';
import RankChart from '@/components/reports/RankChart';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const RatHierarchyReport = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState(30);
  const [rats, setRats] = useState([]);
  const { analysis, loading, error, cached, refetch, forceRefresh } = useHierarchyAnalysis(timeRange);
  const { shouldShowModal, survey, generateTodaySurvey, dismissSurvey } = useDailySurvey();
  const { markRecommendationComplete, isRecommendationCompleted, shouldReduceFrequency } = useRecommendationTracking();
  
  // If user is not authenticated, don't show content
  if (!user) {
    return null;
  }

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

  // Trigger daily survey check when component mounts
  useEffect(() => {
    // Only check for daily survey when user first visits hierarchy page
    const hasCheckedToday = localStorage.getItem(`dailySurveyChecked-${new Date().toDateString()}`);
    if (!hasCheckedToday) {
      localStorage.setItem(`dailySurveyChecked-${new Date().toDateString()}`, 'true');
      // Small delay to allow component to render first
      setTimeout(() => {
        if (!survey) {
          generateTodaySurvey();
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    const handleRefresh = () => {
      refetch();
    };
    
    window.addEventListener('refreshHierarchyAnalysis', handleRefresh);
    return () => window.removeEventListener('refreshHierarchyAnalysis', handleRefresh);
  }, [refetch]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(parseInt(value));
  };

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

  const processRecommendations = (recommendations: string) => {
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
            <div className="flex items-center gap-2">
              <Select value={timeRange.toString()} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">{t('Last 7 days')}</SelectItem>
                  <SelectItem value="30">{t('Last 30 days')}</SelectItem>
                  <SelectItem value="90">{t('Last 90 days')}</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateTodaySurvey}
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
            {analysis.api_cost && (
              <div className="text-xs text-muted-foreground">
                {t('API Cost')}: {analysis.api_cost} ({analysis.model_used})
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{analysis.analysis_summary}</p>
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

      {/* Individual Rat Cards */}
      {analysis?.rats_hierarchy && analysis.rats_hierarchy.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {analysis.rats_hierarchy
            .sort((a, b) => a.rank - b.rank)
            .map((rat, index) => (
              <Card key={rat.rat_id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {index === 0 && <Crown className="h-4 w-4 text-yellow-500" />}
                      {rat.rat_name}
                      {rat.nickname && (
                        <span className="text-sm text-muted-foreground italic">({rat.nickname})</span>
                      )}
                    </CardTitle>
                    <Badge variant="outline">#{rat.rank}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getDominanceColor(rat.dominance_score)}`} />
                    <span className="text-sm font-medium">{getDominanceLabel(rat.dominance_score)}</span>
                    <Badge variant="secondary">{rat.dominance_score}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {rat.analysis && (
                    <p className="text-sm text-muted-foreground mb-3">{rat.analysis}</p>
                  )}
                  
                  {rat.dominant_behaviors && rat.dominant_behaviors.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">{t('Dominant Behaviors')}:</h4>
                      <div className="flex flex-wrap gap-1">
                        {rat.dominant_behaviors.slice(0, 3).map((behavior, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {behavior}
                          </Badge>
                        ))}
                        {rat.dominant_behaviors.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rat.dominant_behaviors.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {rat.submissive_behaviors && rat.submissive_behaviors.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">{t('Submissive Behaviors')}:</h4>
                      <div className="flex flex-wrap gap-1">
                        {rat.submissive_behaviors.slice(0, 3).map((behavior, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {behavior}
                          </Badge>
                        ))}
                        {rat.submissive_behaviors.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{rat.submissive_behaviors.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Interaction Patterns & Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        {analysis?.interaction_patterns && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Interaction Patterns')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{analysis.interaction_patterns}</p>
            </CardContent>
          </Card>
        )}

        {analysis?.recommendations && analysis.recommendations !== '目前沒有發現需要特別注意的問題' && (
          <Card>
            <CardHeader>
              <CardTitle>{t('Recommendations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processRecommendations(analysis.recommendations).map((line, index) => {
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Daily Survey Modal */}
      <DailySurveyModal 
        open={shouldShowModal} 
        onClose={dismissSurvey}
      />
    </div>
  );
};

export default RatHierarchyReport;