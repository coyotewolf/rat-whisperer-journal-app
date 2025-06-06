import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import MultiSelectRats from "@/components/MultiSelectRats"; // Added
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trash2, AlertTriangle } from "lucide-react";
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
  const [selectedRats, setSelectedRats] = useState<string[]>([]); // This will now store rat IDs
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
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
      // Assuming logToEdit.ratId contains a single rat ID
      setSelectedRats(logToEdit.ratId ? [logToEdit.ratId] : []); 
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
  
  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim()]);
      setNewHashtag("");
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
      rat_id: selectedRats[0] || null, // Use the first selected rat ID, or null if none
      hashtags: hashtags,
      // Ensure timestamp is preserved or updated as needed
      timestamp: logToEdit.timestamp, // Or new Date().toISOString() if you want to update it
    };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    onLogUpdated(updatedLogData);
    toast({
      title: t("Success"),
      description: t("Log entry updated successfully!"),
    });
    setLoading(false);
    onClose(); // Close modal after successful update
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onLogDeleted(logToEdit.id); // Call the callback passed from LogsPage
      // Toast notifications are handled by the useLogEntries hook or LogsPage
      onClose(); // Close edit modal
    } catch (error) {
      // Error is caught and handled by the caller (LogsPage -> useLogEntries)
      // Toast for error is also handled there.
      console.error("Error during onDelete in EditLogModal, should be handled by caller:", error);
    } finally {
      setLoading(false);
      setShowConfirmDelete(false); // Close confirmation dialog
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
            {/* Add other health-specific fields like symptoms if needed */}
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 mr-2" // Added margin to the right
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="text-center">{t("Edit Log Entry")} - {t(logToEdit.type.charAt(0).toUpperCase() + logToEdit.type.slice(1))}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmDelete(true)}
              disabled={loading}
              className="text-red-500 hover:text-red-700 ml-auto" // Use ml-auto to push to the right
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rats">{t("Rats")}</Label>
            <MultiSelectRats
              selectedRatIds={selectedRats}
              onSelectionChange={handleRatSelectionChange}
              placeholder={t("Select rats")}
            />
          </div>

          {renderSpecificFields()}

          <div className="space-y-2">
            <Label htmlFor="notes">{t("Notes")}</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Hashtags")}</Label>
            <div className="flex flex-wrap gap-1 mb-2">
              {hashtags.map(tag => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <Trash2 className="h-3 w-3 cursor-pointer" onClick={() => removeHashtag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t("New hashtag")}
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addHashtag();}}}
              />
              <Button type="button" onClick={addHashtag} variant="outline">{t("Add Tag")}</Button>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="w-full sm:w-auto mb-2 sm:mb-0">
                {t("Cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? t("Saving...") : t("Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-500" /> {t("Confirm Deletion")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("Are you sure you want to permanently delete this log entry? This action cannot be undone.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white">
              {loading ? t("Deleting...") : t("Confirm Delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default EditLogModal;