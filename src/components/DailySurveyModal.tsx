import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Clock, X, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useDailySurvey, SurveyQuestion, SurveyAnswer } from '@/hooks/useDailySurvey';

interface DailySurveyModalProps {
  open: boolean;
  onClose: () => void;
}

const DailySurveyModal = ({ open, onClose }: DailySurveyModalProps) => {
  const { t } = useTranslation();
  const { survey, loading, generateTodaySurvey, submitSurveyAnswers } = useDailySurvey();
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleGenerateSurvey = async () => {
    await generateTodaySurvey();
  };

  const handleAnswerChange = (questionId: number, answer: Partial<SurveyAnswer>) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      const updatedAnswer = {
        questionId,
        type: answer.type || 'multiple_choice',
        question: answer.question || '',
        category: answer.category || '',
        ...answer
      } as SurveyAnswer;

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = updatedAnswer;
        return updated;
      } else {
        return [...prev, updatedAnswer];
      }
    });
  };

  const handleSubmit = async () => {
    if (!survey || answers.length === 0) return;
    
    await submitSurveyAnswers(answers);
    onClose();
  };

  const canSubmit = survey?.questions.every(q => 
    answers.some(a => 
      a.questionId === q.id && 
      (a.selectedOption || a.selectedOptions?.length || a.customInput?.trim() || a.textAnswer?.trim())
    )
  );

  const nextQuestion = () => {
    if (currentQuestionIndex < (survey?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'feeding': 'bg-green-100 text-green-800',
      'play': 'bg-blue-100 text-blue-800',
      'territory': 'bg-yellow-100 text-yellow-800',
      'interaction': 'bg-purple-100 text-purple-800'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'feeding': return '🍽️';
      case 'play': return '🎮';
      case 'territory': return '🏰';
      case 'interaction': return '💬';
      default: return '📝';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {t('Daily Interaction Survey')}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {!survey && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('Generate Today\'s Survey')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('Help us understand your rats\' social dynamics with a quick daily survey. The AI will generate personalized questions based on your rat family.')}
                </p>
                <Button 
                  onClick={handleGenerateSurvey} 
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? t('Generating...') : t('Generate Survey Questions')}
                </Button>
              </CardContent>
            </Card>
          )}

          {survey && survey.questions.length > 0 && (
            <div className="space-y-4">
              {/* Progress indicator */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${((currentQuestionIndex + 1) / survey.questions.length) * 100}%` 
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentQuestionIndex + 1} / {survey.questions.length}
                </span>
              </div>

              {/* Current question */}
              {survey.questions.map((question, index) => (
                index === currentQuestionIndex && (
                  <Card key={question.id} className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <span>{getCategoryIcon(question.category)}</span>
                        {question.question}
                        <Badge className={getCategoryColor(question.category)}>
                          {question.category}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {question.type === 'multiple_choice' && question.options && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-2">
                            {question.options.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`q${question.id}-${optionIndex}`}
                                  className="rounded border-border"
                                  checked={answers.find(a => a.questionId === question.id)?.selectedOptions?.includes(option) || false}
                                  onChange={(e) => {
                                    const currentAnswer = answers.find(a => a.questionId === question.id);
                                    const currentOptions = currentAnswer?.selectedOptions || [];
                                    const newOptions = e.target.checked
                                      ? [...currentOptions, option]
                                      : currentOptions.filter(o => o !== option);
                                    
                                    handleAnswerChange(question.id, {
                                      type: 'multiple_choice',
                                      question: question.question,
                                      category: question.category,
                                      selectedOptions: newOptions
                                    });
                                  }}
                                />
                                <Label htmlFor={`q${question.id}-${optionIndex}`}>{option}</Label>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`q${question.id}-custom`}>{t('或者手動輸入')}</Label>
                            <input
                              type="text"
                              id={`q${question.id}-custom`}
                              className="w-full px-3 py-2 border rounded-md border-border bg-background"
                              placeholder={t('輸入其他選項...')}
                              value={answers.find(a => a.questionId === question.id)?.customInput || ''}
                              onChange={(e) => {
                                handleAnswerChange(question.id, {
                                  type: 'multiple_choice',
                                  question: question.question,
                                  category: question.category,
                                  customInput: e.target.value
                                });
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {question.type === 'text' && (
                        <Textarea
                          placeholder={t('Describe what you observed...')}
                          value={answers.find(a => a.questionId === question.id)?.textAnswer || ''}
                          onChange={(e) => 
                            handleAnswerChange(question.id, {
                              type: 'text',
                              question: question.question,
                              category: question.category,
                              textAnswer: e.target.value
                            })
                          }
                          className="min-h-[100px]"
                        />
                      )}
                    </CardContent>
                  </Card>
                )
              ))}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between gap-4">
                <Button 
                  variant="outline" 
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  {t('Previous')}
                </Button>

                <div className="flex items-center gap-2">
                  {survey.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentQuestionIndex 
                          ? 'bg-primary' 
                          : answers.some(a => a.questionId === survey.questions[index].id && (a.selectedOption || a.selectedOptions?.length || a.customInput?.trim() || a.textAnswer?.trim()))
                            ? 'bg-green-500'
                            : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>

                {currentQuestionIndex === survey.questions.length - 1 ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={!canSubmit || loading}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? t('Submitting...') : t('Submit Survey')}
                  </Button>
                ) : (
                  <Button 
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === survey.questions.length - 1}
                  >
                    {t('Next')}
                  </Button>
                )}
              </div>

              {/* Summary of answered questions */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">{t('Progress Summary')}</h4>
                <div className="flex flex-wrap gap-2">
                  {survey.questions.map((question, index) => {
                    const answer = answers.find(a => a.questionId === question.id);
                    const isAnswered = answer && (answer.selectedOption || answer.selectedOptions?.length || answer.customInput?.trim() || answer.textAnswer?.trim());
                    
                    return (
                      <Badge 
                        key={question.id}
                        variant={isAnswered ? "default" : "outline"}
                        className="text-xs"
                      >
                        {index + 1}. {question.category}
                        {isAnswered && " ✓"}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailySurveyModal;