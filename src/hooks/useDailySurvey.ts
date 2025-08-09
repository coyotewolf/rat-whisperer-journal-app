import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import i18n from '@/i18n';
export interface SurveyQuestion {
  id: number;
  type: 'multiple_choice' | 'text';
  question: string;
  options?: string[];
  category: string;
}

export interface SurveyAnswer {
  questionId: number;
  type: 'multiple_choice' | 'text';
  question: string;
  selectedOption?: string;
  selectedOptions?: string[];
  customInput?: string;
  textAnswer?: string;
  category: string;
}

export interface DailySurvey {
  surveyId: string;
  questions: SurveyQuestion[];
  surveyDate: string;
  completed: boolean;
}

export const useDailySurvey = () => {
  const { user } = useAuth();
  const [survey, setSurvey] = useState<DailySurvey | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [lastApiCost, setLastApiCost] = useState<number>(0);

  const checkTodaySurvey = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('daily-interaction-survey', {
        body: { action: 'check' }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to check survey');
      }

      if (data.data.exists && !data.data.completed) {
        // Survey exists but not completed
        setSurvey({
          surveyId: data.data.survey.id,
          questions: data.data.survey.questions,
          surveyDate: data.data.survey.survey_date,
          completed: false
        });
        setShouldShowModal(true);
      } else if (!data.data.exists) {
        // No survey for today, should trigger generation
        setShouldShowModal(true);
      }
      // If survey exists and completed, don't show modal

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check daily survey';
      setError(errorMessage);
      console.error('Error checking daily survey:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateTodaySurvey = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('daily-interaction-survey', {
        body: { action: 'generate' }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate survey');
      }

      setSurvey({
        surveyId: data.data.surveyId,
        questions: data.data.questions,
        surveyDate: data.data.surveyDate,
        completed: false
      });
      setLastApiCost(Number(data.data.api_cost_estimate || 0));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate daily survey';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitSurveyAnswers = async (answers: SurveyAnswer[]) => {
    if (!user || !survey) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('daily-interaction-survey', {
        body: { 
          action: 'submit',
          surveyId: survey.surveyId,
          answers: answers
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to submit survey');
      }

      setSurvey(prev => prev ? { ...prev, completed: true } : null);
      setShouldShowModal(false);
      toast.success('✅ ' + i18n.t('daily_survey_submitted'));
      
      // Auto trigger hierarchy analysis refresh
      window.dispatchEvent(new CustomEvent('refreshHierarchyAnalysis'));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit survey';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const dismissSurvey = () => {
    setShouldShowModal(false);
    setSurvey(null);
  };

  // Check for daily survey on mount and when user changes
  useEffect(() => {
    if (user) {
      checkTodaySurvey();
    }
  }, [user]);

  return {
    survey,
    loading,
    error,
    shouldShowModal,
    checkTodaySurvey,
    generateTodaySurvey,
    submitSurveyAnswers,
    dismissSurvey,
    lastApiCost,
  };
};