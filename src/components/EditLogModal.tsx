
import { useState, useEffect, useCallback, useMemo } from "react";
import { cn, dialogContentStyles } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
      setFormData({
        notes: logToEdit.notes || "",
      });
      setSelectedRats(logToEdit.ratIds || []);
      // 行為日誌和健康日誌都使用 hashtag
      setHashtags((logToEdit.type === 'behavior' || logToEdit.type === 'health') ? logToEdit.hashtags || [] : []);
    }
  }, [logToEdit]);


  const handleDataChange = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  const handleTagsChange = (tags: string[]) => {
    setHashtags(tags);
  };

  const handleRatSelectionChange = (ratIds: string[]) => {
    setSelectedRats(ratIds);
  };
  
  const handleTagSelection = (tagName: string) => {
    if (hashtags.includes(tagName)) {
      setHashtags(prev => prev.filter(tag => tag !== tagName));
    } else {
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
      ...formData,
      ratIds: selectedRats,
      hashtags: hashtags,
      timestamp: logToEdit.timestamp,
    };
    
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
      initialData: logToEdit,
      onDataChange: handleDataChange,
    };

    switch (logToEdit.type) {
      case 'behavior':
        return <BehaviorLogForm {...formProps} selectedTags={hashtags} onTagsChange={handleTagsChange} />;
      case 'health':
        return <HealthLogForm {...formProps} selectedTags={hashtags} onTagsChange={handleTagsChange} />;
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
      <DialogContent className={cn(dialogContentStyles)}>
        <DialogHeader className={cn("p-4 pb-2")}>
          <div className={cn("flex items-center")}>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={cn("text-muted-foreground hover:text-foreground mr-2")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className={cn("text-center flex-1 text-lg")}>{t("Edit Log Entry")} - {t(logToEdit.type.charAt(0).toUpperCase() + logToEdit.type.slice(1))}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              disabled={loading}
              className={cn("text-destructive hover:text-destructive/80 ml-2")}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <DialogDescription className="sr-only">
          {t("Edit your log entry here.")}
        </DialogDescription>
        <div className="flex-1 overflow-y-auto px-4">
          <form onSubmit={handleSubmit} className={cn("space-y-4 py-4")} id="edit-log-form">
            <div className={cn("space-y-2")}>
              <Label htmlFor="rats">{t("Rats")}</Label>
              <MultiSelectRats
                selectedRatIds={selectedRats}
                onSelectionChange={handleRatSelectionChange}
                placeholder={t("Select rats")}
              />
            </div>

            {renderLogTypeFields()}
          </form>
        </div>

        <DialogFooter className={cn("p-4 pt-2")}>
          <div className={cn("flex flex-col sm:flex-row sm:justify-end sm:space-x-2 w-full gap-2")}>
            <DialogClose asChild>
              <Button type="button" variant="outline" className={cn("w-full sm:w-auto")}>
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              form="edit-log-form"
              disabled={loading} 
              className={cn("w-full sm:w-auto")}
            >
              {loading ? t("Saving...") : t("Save Changes")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn("flex items-center")}>
              <AlertTriangle className={cn("mr-2 h-5 w-5 text-destructive")} /> {t("Confirm Deletion")}
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
