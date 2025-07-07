
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { cn, dialogContentStyles } from "@/lib/utils";
import MultiSelectRats from "@/components/MultiSelectRats";

// Import new log form components
import BehaviorLogForm from "./log-forms/BehaviorLogForm";
import HealthLogForm from "./log-forms/HealthLogForm";
import WeightLogForm from "./log-forms/WeightLogForm";
import EnvironmentLogForm from "./log-forms/EnvironmentLogForm";
import MedicationLogForm from "./log-forms/MedicationLogForm";
import FeedingLogForm from "./log-forms/FeedingLogForm";

interface LogEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  logType: string;
  onLogAdded: (newLog: any) => void;
}

const LogEntryModal = ({ isOpen, onClose, onBack, logType, onLogAdded }: LogEntryModalProps) => {
  const [rats, setRats] = useState<any[]>([]);
  const [selectedRats, setSelectedRats] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && isOpen) {
      fetchRats();
      resetForm(); 
    }
  }, [user, isOpen, logType]);

  useEffect(() => {
    console.log("LogEntryModal: selectedRats changed to", selectedRats);
  }, [selectedRats]);

  const fetchRats = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('rats')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');
    
    if (!error) {
      setRats(data || []);
      setSelectedRats([]);
    }
  };

  const handleDataChange = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: t("Error"), description: t("User not authenticated."), variant: "destructive" });
      return;
    }
    if (selectedRats.length === 0) {
      toast({ title: t("Error"), description: t("Please select at least one rat."), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      console.log('LogEntryModal: formData before submit:', formData);
      console.log('LogEntryModal: logType:', logType);
      
      let contentPayload = { ...formData };
      if (logType === 'behavior' || logType === 'health') {
        contentPayload.tags = selectedTags;
      }

      console.log('LogEntryModal: contentPayload:', contentPayload);

      // 特別檢查健康日誌的狀態值
      if (logType === 'health' && !contentPayload.status) {
        console.error('Health log missing status value');
        toast({ 
          title: t("Error"), 
          description: "健康狀態不能為空", 
          variant: "destructive" 
        });
        return;
      }

      const logEntryData = {
        user_id: user.id,
        ratIds: selectedRats,
        type: logType,
        behavior: logType === 'behavior' ? contentPayload.behavior : undefined,
        notes: contentPayload.notes,
        hashtags: (logType === 'behavior' || logType === 'health') ? selectedTags : undefined,
        weight: contentPayload.weight,
        temperature: contentPayload.temperature,
        humidity: contentPayload.humidity,
        symptoms: contentPayload.symptoms,
        medication: contentPayload.medication,
        dose: contentPayload.dose,
        food: contentPayload.food,
        amount: contentPayload.amount,
        status: contentPayload.status,
      };
      
      console.log('LogEntryModal: final logEntryData:', logEntryData);
      
      await onLogAdded(logEntryData);
      onClose();
    } catch (error: any) {
      console.error('Error preparing log entry or calling onLogAdded:', error);
      toast({ title: t("Error"), description: t("An unexpected error occurred."), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedRats([]);
    setFormData({});
    setSelectedTags([]);
  };

  const renderLogTypeFields = useMemo(() => {
    const formProps = {
      initialData: {},
      onDataChange: handleDataChange,
    };

    switch (logType) {
      case 'behavior':
        return <BehaviorLogForm {...formProps} selectedTags={selectedTags} onTagsChange={handleTagsChange} />;
      case 'health':
        return <HealthLogForm {...formProps} selectedTags={selectedTags} onTagsChange={handleTagsChange} />;
      case 'weight':
        return <WeightLogForm {...formProps} />;
      case 'environment':
        return <EnvironmentLogForm {...formProps} />;
      case 'medication':
        return <MedicationLogForm {...formProps} />;
      case 'feeding':
        return <FeedingLogForm {...formProps} />;
      default:
        return <p>{t("Unknown log type")}</p>;
    }
  }, [logType, selectedTags, handleDataChange, handleTagsChange, t]);

  return (
    <Dialog open={isOpen} onOpenChange={(openState) => {
      if (!openState) {
        onClose(); 
      }
    }}>
      <DialogContent className={cn(dialogContentStyles)}>
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center text-lg">{t("Add {{logType}} Log", { logType: t(logType.charAt(0).toUpperCase() + logType.slice(1)) })}</DialogTitle>
            <div className="w-12"></div>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <form onSubmit={handleSubmit} className="space-y-4 py-4" id="add-log-form">
            <div className="space-y-2">
              <Label htmlFor="rats">{t("Select Rats")}</Label>
              <MultiSelectRats
                selectedRatIds={selectedRats}
                onSelectionChange={setSelectedRats}
                placeholder={t("Select rats")}
              />
            </div>
            
            {renderLogTypeFields}
          </form>
        </div>
        <DialogFooter className="p-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 w-full gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" form="add-log-form" disabled={loading} className="w-full sm:w-auto">
              {loading ? t("Adding...") : t("Add Log Entry")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogEntryModal;
