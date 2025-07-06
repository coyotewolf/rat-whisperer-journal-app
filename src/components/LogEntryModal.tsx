
import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
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
      let contentPayload = { ...formData };
      if (logType === 'behavior' || logType === 'health') {
        contentPayload.tags = selectedTags;
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">{t("Add {{logType}} Log", { logType: t(logType.charAt(0).toUpperCase() + logType.slice(1)) })}</DialogTitle>
            <div className="w-10"></div>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rats">{t("Select Rats")}</Label>
            <MultiSelectRats
              selectedRatIds={selectedRats}
              onSelectionChange={setSelectedRats}
              placeholder={t("Select rats")}
            />
          </div>
          
          {renderLogTypeFields}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("Cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("Adding...") : t("Add Log Entry")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LogEntryModal;
