import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import MultiSelectRats from "@/components/MultiSelectRats"; // Import MultiSelectRats

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
  const [selectedRats, setSelectedRats] = useState<string[]>([]); // Changed to array for MultiSelectRats
  const [formData, setFormData] = useState<any>({});
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Specifically for behavior logs
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (user && isOpen) {
      fetchRats();
      // Reset form data when modal opens or logType changes
      resetForm(); 
    }
  }, [user, isOpen, logType]);

  // Add a useEffect to log selectedRats whenever it changes
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
      setSelectedRats([]); // 確保在獲取老鼠列表後，rat 欄位是空的
    }
  };

  const handleDataChange = useCallback((data: any) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []); // No dependencies, as setFormData is stable

  const handleTagsChange = useCallback((tags: string[]) => {
    setSelectedTags(tags);
  }, []); // No dependencies, as setSelectedTags is stable

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: t("Error"), description: t("User not authenticated."), variant: "destructive" });
      return;
    }
    if (selectedRats.length === 0) { // Check if any rat is selected
      toast({ title: t("Error"), description: t("Please select at least one rat."), variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let contentPayload = { ...formData };
      if (logType === 'behavior') {
        contentPayload.tags = selectedTags;
      }

      const { data: newLogData, error } = await supabase
        .from('log_entries')
        .insert({
          user_id: user.id,
          rat_ids: selectedRats, // Only use rat_ids
          type: logType,
          content: contentPayload
        })
        .select()
        .single(); // Assuming we expect a single record back

      if (error) throw error;

      toast({ title: t("Success"), description: t("Log entry added successfully!") });
      
      if (newLogData) {
        onLogAdded(newLogData);
      }
      onClose(); // This should trigger the full close and navigation via QuickLogModal
      // resetForm(); // Resetting form is now handled by useEffect on isOpen/logType change
    } catch (error: any) {
      console.error('Error adding log entry:', error);
      toast({ title: t("Error"), description: error.message || t("Failed to add log entry"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    // Keep selectedRats as is, or reset if needed based on UX decision
    setSelectedRats([]); // Uncomment if rat selection should reset too
    setFormData({});
    setSelectedTags([]);
  };

  const renderLogTypeFields = useMemo(() => {
    const formProps = {
      initialData: {}, // For "Add New", initialData is empty
      onDataChange: handleDataChange,
    };

    switch (logType) {
      case 'behavior':
        return <BehaviorLogForm {...formProps} selectedTags={selectedTags} onTagsChange={handleTagsChange} />;
      case 'health':
        return <HealthLogForm {...formProps} />;
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
  }, [logType, selectedTags, handleDataChange, handleTagsChange, t]); // Dependencies for useMemo

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
            <div className="w-10"></div> {/* Spacer */}
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
          
          {renderLogTypeFields} {/* Call useMemo result directly */}
          
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
