import { Button } from "@/components/ui/button";
import { Droplets, UtensilsCrossed, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useState } from "react";

const QuickLogButtons = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState<string | null>(null);

  const handleQuickLog = async (type: string, label: string) => {
    if (!user) {
      toast({
        title: t('Authentication Required'),
        description: t('Please sign in to log activities'),
        variant: "destructive"
      });
      return;
    }

    setLoading(type);

    try {
      // Fetch all user's rats
      const { data: rats, error: ratsError } = await supabase
        .from('rats')
        .select('id')
        .eq('user_id', user.id);

      if (ratsError) throw ratsError;

      if (!rats || rats.length === 0) {
        toast({
          title: t('No Rats Found'),
          description: t('Please add rats before logging activities'),
          variant: "destructive"
        });
        return;
      }

      const ratIds = rats.map(rat => rat.id);

      // Create log entry
      const logData = {
        user_id: user.id,
        type: type === 'feeding' ? 'feeding' : 'environment',
        rat_ids: ratIds,
        content: {
          notes: label,
          tags: [type],
          timestamp: new Date().toISOString()
        }
      };

      const { error: logError } = await supabase
        .from('log_entries')
        .insert(logData);

      if (logError) throw logError;

      toast({
        title: t('Logged Successfully'),
        description: `${t(label)} - ${t('All rats')}`,
      });
    } catch (error: any) {
      console.error('Quick log error:', error);
      toast({
        title: t('Error'),
        description: error.message || t('Failed to log activity'),
        variant: "destructive"
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <Button
        variant="outline"
        className="flex flex-col items-center gap-1 h-auto py-3 px-2"
        onClick={() => handleQuickLog('feeding', 'Added Food')}
        disabled={loading === 'feeding'}
      >
        <UtensilsCrossed className="h-5 w-5" />
        <span className="text-xs">{t('Add Food')}</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center gap-1 h-auto py-3 px-2"
        onClick={() => handleQuickLog('water', 'Changed Water')}
        disabled={loading === 'water'}
      >
        <Droplets className="h-5 w-5" />
        <span className="text-xs">{t('Change Water')}</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center gap-1 h-auto py-3 px-2"
        onClick={() => handleQuickLog('cage_cleaning', 'Cleaned Cage')}
        disabled={loading === 'cage_cleaning'}
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-xs">{t('Clean Cage')}</span>
      </Button>
      
      <Button
        variant="outline"
        className="flex flex-col items-center gap-1 h-auto py-3 px-2"
        onClick={() => handleQuickLog('litter_cleaning', 'Cleaned Litter')}
        disabled={loading === 'litter_cleaning'}
      >
        <Trash2 className="h-5 w-5" />
        <span className="text-xs">{t('Clean Litter')}</span>
      </Button>
    </div>
  );
};

export default QuickLogButtons;
