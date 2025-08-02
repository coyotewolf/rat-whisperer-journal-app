import { useState, useEffect } from 'react';

interface CompletedRecommendation {
  id: string;
  text: string;
  completedAt: number;
  completedCount: number;
}

export const useRecommendationTracking = () => {
  const [completedRecommendations, setCompletedRecommendations] = useState<CompletedRecommendation[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('completedRecommendations');
    if (saved) {
      setCompletedRecommendations(JSON.parse(saved));
    }
  }, []);

  const markRecommendationComplete = (recommendationText: string) => {
    const id = btoa(recommendationText).slice(0, 16);
    const existing = completedRecommendations.find(r => r.id === id);
    
    const updated = existing 
      ? completedRecommendations.map(r => 
          r.id === id 
            ? { ...r, completedAt: Date.now(), completedCount: r.completedCount + 1 }
            : r
        )
      : [...completedRecommendations, {
          id,
          text: recommendationText,
          completedAt: Date.now(),
          completedCount: 1
        }];
    
    setCompletedRecommendations(updated);
    localStorage.setItem('completedRecommendations', JSON.stringify(updated));
  };

  const isRecommendationCompleted = (recommendationText: string) => {
    const id = btoa(recommendationText).slice(0, 16);
    const completed = completedRecommendations.find(r => r.id === id);
    return completed ? completed.completedCount : 0;
  };

  const shouldReduceFrequency = (recommendationText: string) => {
    const completedCount = isRecommendationCompleted(recommendationText);
    return completedCount > 0 && Math.random() > (1 / (completedCount + 1));
  };

  return {
    markRecommendationComplete,
    isRecommendationCompleted,
    shouldReduceFrequency
  };
};