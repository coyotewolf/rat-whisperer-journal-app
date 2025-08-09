import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RatHierarchyData } from '@/hooks/useHierarchyAnalysis';

interface RankChartProps {
  data: RatHierarchyData[];
  rats: any[];
}

const RankChart = ({ data, rats }: RankChartProps) => {
  const { t } = useTranslation();
  const [selectedRat, setSelectedRat] = useState<RatHierarchyData | null>(null);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${rank}`;
    }
  };

  const nicknameEmoji = (nickname?: string) => {
    if (!nickname) return '';
    const n = nickname.toLowerCase();
    if (/[和平|peace|和事佬]/.test(n)) return '🕊️';
    if (/[暴躁|aggressive|怒|霸道]/.test(n)) return '😠';
    if (/[邊緣|loner|獨行]/.test(n)) return '🫥';
    if (/[探索|探險|explorer|冒險]/.test(n)) return '🧭';
    if (/[領袖|leader|老大|王]/.test(n)) return '👑';
    if (/[溫柔|gentle|柔]/.test(n)) return '🌷';
    if (/[好奇|curious]/.test(n)) return '🧐';
    if (/[愛玩|playful|調皮]/.test(n)) return '🎉';
    if (/[友善|social|friendly|社交]/.test(n)) return '🤝';
    if (/[貪吃|吃貨|foodie]/.test(n)) return '🍽️';
    return '✨';
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
    <>
      <div className="space-y-3">
        {sortedData.map((rat) => {
          const profile = getRatProfile(rat.rat_id);
          
          return (
            <Card 
              key={rat.rat_id} 
              className={`transition-all hover:shadow-md cursor-pointer ${getRankColor(rat.rank)}`}
              onClick={() => setSelectedRat(rat)}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="flex-shrink-0 text-xl font-bold">
                    {getRankEmoji(rat.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage 
                      src={profile?.profile_picture} 
                      alt={rat.rat_name || 'Unknown'} 
                    />
                    <AvatarFallback className="text-sm font-medium">
                      {rat.rat_name ? rat.rat_name.charAt(0) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Name and Nickname */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {rat.rat_name || 'Unknown'}
                      </span>
                      {rat.nickname && (
                        <Badge variant="secondary" className="text-xs">
                          {(() => {
                            const n = rat.nickname;
                            const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u2600-\u26FF\u2700-\u27BF]/u.test(n);
                            return hasEmoji ? n : `${n} ${nicknameEmoji(n)}`;
                          })()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedRat} onOpenChange={(open) => !open && setSelectedRat(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{selectedRat && getRankEmoji(selectedRat.rank)}</span>
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={getRatProfile(selectedRat?.rat_id || '')?.profile_picture} 
                  alt={selectedRat?.rat_name || 'Unknown'} 
                />
                <AvatarFallback className="text-sm">
                  {selectedRat?.rat_name ? selectedRat.rat_name.charAt(0) : '?'}
                </AvatarFallback>
              </Avatar>
              {selectedRat?.rat_name || 'Unknown'}
              {selectedRat?.nickname && (
                <Badge variant="secondary" className="text-xs">
                  {(() => {
                    const n = selectedRat.nickname;
                    const hasEmoji = /[\u{1F300}-\u{1FAFF}\u{1F900}-\u{1F9FF}\u2600-\u26FF\u2700-\u27BF]/u.test(n);
                    return hasEmoji ? n : `${n} ${nicknameEmoji(n)}`;
                  })()}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedRat && (
            <div className="space-y-4">
              {/* Rank and Score */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('Rank')}:</span>
                  <span className="font-bold">#{selectedRat.rank}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t('Dominance Score')}:</span>
                  <Badge 
                    variant={selectedRat.dominance_score >= 0 ? "destructive" : "secondary"}
                    className="font-bold"
                  >
                    {selectedRat.dominance_score > 0 ? '+' : ''}{selectedRat.dominance_score}
                  </Badge>
                </div>
              </div>
              
              {/* Analysis */}
              {selectedRat.analysis && (
                <div>
                  <h4 className="font-medium mb-2">{t('Analysis Summary')}</h4>
                  <p className="text-sm text-muted-foreground">{selectedRat.analysis}</p>
                </div>
              )}
              
              {/* Behaviors */}
              {(selectedRat.dominant_behaviors?.length > 0 || selectedRat.submissive_behaviors?.length > 0) && (
                <div className="space-y-3">
                  {selectedRat.dominant_behaviors && selectedRat.dominant_behaviors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">{t('Dominant Behaviors')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRat.dominant_behaviors.map((behavior, idx) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {t(behavior)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedRat.submissive_behaviors && selectedRat.submissive_behaviors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">{t('Submissive Behaviors')}</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedRat.submissive_behaviors.map((behavior, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {t(behavior)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RankChart;