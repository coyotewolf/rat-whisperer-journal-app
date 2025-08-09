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

  // Safe base64 encoder for Unicode strings
  const toBase64 = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    } catch (e) {
      // Fallback for older browsers
      return btoa(unescape(encodeURIComponent(str)));
    }
  };

  const idFromText = (text: string) => toBase64(text).slice(0, 16);

  const markRecommendationComplete = (recommendationText: string) => {
    const id = idFromText(recommendationText);
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
    const id = idFromText(recommendationText);
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