
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import MultiSelectRats from "@/components/MultiSelectRats";
import LogTagSuggestions from "@/components/LogTagSuggestions";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import log form components
import BehaviorLogForm from "./log-forms/BehaviorLogForm";
import HealthLogForm from "./log-forms/HealthLogForm";
import WeightLogForm from "./log-forms/WeightLogForm";
import EnvironmentLogForm from "./log-forms/EnvironmentLogForm";
import MedicationLogForm from "./log-forms/MedicationLogForm";
import FeedingLogForm from "./log-forms/FeedingLogForm";

interface EditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logToEdit: any;
  onLogUpdated: (updatedLog: any) => void;
  onLogDeleted: (deletedLogId: string) => void;
}

const EditLogModal = ({ isOpen, onClose, logToEdit, onLogUpdated, onLogDeleted }: EditLogModalProps) => {
  const [formData, setFormData] = useState<any>({});
  const [selectedRats, setSelectedRats] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (logToEdit) {
      // Pre-fill form data based on the log being edited
      // For specific log types, initialData will be passed to the sub-forms
      setFormData({
        notes: logToEdit.notes || "",
        // The specific fields (behavior, weight, temp, humidity) will be handled by sub-forms
      });
      setSelectedRats(logToEdit.ratIds || []);
      // 只有行為日誌才使用 hashtag，其他類型清空
      setHashtags(logToEdit.type === 'behavior' ? logToEdit.hashtags || [] : []);
    }
  }, [logToEdit]);

  const handleDataChange = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleTagsChange = (tags: string[]) => {
    setHashtags(tags);
  };

  // This function will be called by the MultiSelectRats component
  const handleRatSelectionChange = (ratIds: string[]) => {
    setSelectedRats(ratIds);
  };
  
  const handleTagSelection = (tagName: string) => {
    if (hashtags.includes(tagName)) {
      // Remove tag if already selected
      setHashtags(prev => prev.filter(tag => tag !== tagName));
    } else {
      // Add tag if not selected
      setHashtags(prev => [...prev, tagName]);
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
 
    const updatedLogData = {
      ...logToEdit,
      ...formData, // formData now contains data from sub-forms
      ratIds: selectedRats,
      hashtags: hashtags,
      timestamp: logToEdit.timestamp,
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    onLogUpdated(updatedLogData);
    toast({
      title: t("Success"),
      description: t("Log entry updated successfully!"),
    });
    setLoading(false);
    onClose();
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onLogDeleted(logToEdit.id);
      onClose();
    } catch (error) {
      console.error("Error during onDelete in EditLogModal, should be handled by caller:", error);
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  if (!logToEdit) return null;

  const renderLogTypeFields = () => {
    const formProps = {
      initialData: logToEdit, // Pass the entire logToEdit as initialData
      onDataChange: handleDataChange,
    };

    switch (logToEdit.type) {
      case 'behavior':
        return <BehaviorLogForm {...formProps} selectedTags={hashtags} onTagsChange={handleTagsChange} />;
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("sm:max-w-md bg-card text-card-foreground")}> {/* Themed background and text */}
        <DialogHeader>
          <div className={cn("flex items-center")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn("text-muted-foreground hover:text-foreground mr-2")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className={cn("text-center")}>{t("Edit Log Entry")} - {t(logToEdit.type.charAt(0).toUpperCase() + logToEdit.type.slice(1))}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              disabled={loading}
              className={cn("text-destructive hover:text-destructive/80 ml-auto")}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className={cn("space-y-4 py-4")}>
          <div className={cn("space-y-2")}>
            <Label htmlFor="rats">{t("Rats")}</Label>
            <MultiSelectRats
              selectedRatIds={selectedRats}
              onSelectionChange={handleRatSelectionChange}
              placeholder={t("Select rats")}
            />
          </div>

          {renderLogTypeFields()}

          <DialogFooter className={cn("flex flex-col sm:flex-row sm:justify-end sm:space-x-2")}>
            <DialogClose asChild>
              <Button type="button" variant="outline" className={cn("w-full sm:w-auto mb-2 sm:mb-0")}>
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className={cn("w-full sm:w-auto")}>
              {loading ? t("Saving...") : t("Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn("flex items-center")}>
              <AlertTriangle className={cn("mr-2 h-5 w-5 text-destructive")} /> {t("Confirm Deletion")} {/* Themed icon */}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to permanently delete this log entry? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className={cn("bg-destructive hover:bg-destructive/90 text-destructive-foreground")}>
              {loading ? t("Deleting...") : t("Confirm Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default EditLogModal;
