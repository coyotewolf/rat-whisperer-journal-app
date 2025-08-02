import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RatHierarchyData } from '@/hooks/useHierarchyAnalysis';

interface RankChartProps {
  data: RatHierarchyData[];
  rats: any[];
}

const RankChart = ({ data, rats }: RankChartProps) => {
  const { t } = useTranslation();

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const getRatProfile = (ratId: string) => {
    return rats.find(rat => rat.id === ratId);
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950';
      case 2: return 'border-gray-400 bg-gray-50 dark:bg-gray-950';
      case 3: return 'border-orange-400 bg-orange-50 dark:bg-orange-950';
      default: return 'border-border bg-card';
    }
  };

  // Guard against empty data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        {t('No data available')}
      </div>
    );
  }

  // Sort data by rank
  const sortedData = [...data].sort((a, b) => a.rank - b.rank);

  return (
    <div className="space-y-3">
      {sortedData.map((rat) => {
        const profile = getRatProfile(rat.rat_id);
        
        return (
          <Card 
            key={rat.rat_id} 
            className={`transition-all hover:shadow-md ${getRankColor(rat.rank)}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 text-2xl font-bold">
                  {getRankEmoji(rat.rank)}
                </div>
                
                {/* Avatar */}
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage 
                    src={profile?.profile_picture} 
                    alt={rat.rat_name || 'Unknown'} 
                  />
                  <AvatarFallback className="text-sm font-medium">
                    {rat.rat_name ? rat.rat_name.charAt(0) : '?'}
                  </AvatarFallback>
                </Avatar>
                
                {/* Name and Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold truncate">
                      {rat.rat_name || 'Unknown'}
                    </h3>
                    {rat.nickname && (
                      <Badge variant="secondary" className="text-xs">
                        {rat.nickname}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>#{rat.rank}</span>
                    <span>•</span>
                    <span>{t('Dominance Score')}: {rat.dominance_score}</span>
                  </div>
                  
                  {rat.analysis && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {rat.analysis}
                    </p>
                  )}
                </div>
                
                {/* Dominance Score Badge */}
                <div className="flex-shrink-0">
                  <Badge 
                    variant={rat.dominance_score >= 0 ? "destructive" : "secondary"}
                    className="text-sm font-bold"
                  >
                    {rat.dominance_score > 0 ? '+' : ''}{rat.dominance_score}
                  </Badge>
                </div>
              </div>
              
              {/* Behaviors */}
              {(rat.dominant_behaviors?.length > 0 || rat.submissive_behaviors?.length > 0) && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {rat.dominant_behaviors && rat.dominant_behaviors.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">
                          {t('Dominant Behaviors')}
                        </h4>
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
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">
                          {t('Submissive Behaviors')}
                        </h4>
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
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default RankChart;