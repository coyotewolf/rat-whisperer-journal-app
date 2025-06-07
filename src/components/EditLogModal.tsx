
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
      setFormData({
        notes: logToEdit.notes || "",
        behavior: logToEdit.behavior || "",
        weight: logToEdit.weight || "",
        temperature: logToEdit.temperature || "",
        humidity: logToEdit.humidity || "",
        // Add other fields as necessary based on log structure
      });
      // Use ratIds array if available, rat_id is no longer used
      setSelectedRats(logToEdit.ratIds || []);
      setHashtags(logToEdit.hashtags || []);
    }
  }, [logToEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [id]: value }));
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
      ...formData,
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

  const renderSpecificFields = () => {
    switch (logToEdit.type) {
      case "behavior":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="behavior">{t("Behavior")}</Label>
              <Input
                id="behavior"
                value={formData.behavior || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      case "health":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="weight">{t("Weight (g)")}</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      case "environment":
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="temperature">{t("Temperature (°C)")}</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity">{t("Humidity (%)")}</Label>
              <Input
                id="humidity"
                type="number"
                value={formData.humidity || ""}
                onChange={handleInputChange}
              />
            </div>
          </>
        );
      default:
        return null;
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

          {renderSpecificFields()}

          <div className={cn("space-y-2")}>
            <Label htmlFor="notes">{t("Notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className={cn("space-y-2")}>
            <Label>{t("Tags")}</Label>
            <div className={cn("flex flex-wrap gap-1 mb-2")}>
              {hashtags.map(tag => (
                <Badge key={tag} variant="secondary" className={cn("flex items-center gap-1")}>
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
                </Badge>
              ))}
            </div>
            <LogTagSuggestions
              onSelect={handleTagSelection}
              selectedTags={hashtags}
            />
          </div>
          
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
