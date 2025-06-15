
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Settings2 as ManageIcon, ArrowLeft } from 'lucide-react';
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { usePersonalityTags, PersonalityTag } from "@/hooks/usePersonalityTags";
import PersonalityTagSettings from "./settings/PersonalityTagSettings";
import { AddPersonalityTagForm } from "./settings/AddPersonalityTagForm";

interface PersonalityTagManagerProps {
  onSelect: (tag: PersonalityTag) => void;
  selectedTags: PersonalityTag[];
  placeholder?: string;
}

const PersonalityTagManager = ({ onSelect, selectedTags, placeholder }: PersonalityTagManagerProps) => {
  const { t } = useTranslation();
  const { personalityTags: availableTags, loading, refetch } = usePersonalityTags();
  
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const handleTagToggle = (tagToToggle: PersonalityTag) => {
    onSelect(tagToToggle);
  };

  const handleManageModalClose = () => {
    setIsManageModalOpen(false);
    // Refresh tags when modal closes to pick up any newly added tags
    refetch();
  };

  const handleQuickAddCompleted = () => {
    setShowQuickAdd(false);
    refetch();
  };

  // Helper to get themed classes for a given color string
  const getThemedColorClasses = (colorName: string) => {
    switch (colorName) {
      case "blue": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30";
      case "purple": return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30";
      case "red": return "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30";
      case "green": return "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30";
      case "orange": return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30";
      case "yellow": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30";
      case "pink": return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/30";
      case "cyan": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30";
      case "indigo": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30";
      case "gray": return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/30";
      default: return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">{t("Loading personality tags...")}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">{placeholder || t("Personality Tags:")}</p>
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowQuickAdd(prev => !prev)}
            title={t("Quick add personality tag")}
            className="text-green-600 hover:text-green-700"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setIsManageModalOpen(true)} title={t("Manage personality tags")}>
            <ManageIcon className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
        </div>
      </div>

      {showQuickAdd && (
        <div className="p-3 border rounded-lg bg-white shadow-sm">
          <AddPersonalityTagForm
            onTagAdded={handleQuickAddCompleted}
            onCancel={() => setShowQuickAdd(false)}
            showCancelButton={true}
          />
        </div>
      )}

      {availableTags.length === 0 && !showQuickAdd ? (
         <p className="text-xs text-gray-500 py-2">{placeholder ? t("No {{placeholder}} yet. Click 'Manage' to add one.", { placeholder: placeholder.toLowerCase() }) : t("No personality tags yet. Click 'Manage' to add one.")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.some(selectedTag => selectedTag.id === tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors border-2 ${
                  isSelected
                    ? "bg-orange-500 text-white"
                    : "hover:bg-orange-100"
                } ${getThemedColorClasses(tag.color)}`}
                style={{ 
                  ...(isSelected && {
                    backgroundColor: '#f97316',
                    borderColor: '#f97316'
                  }),
                  ...(!isSelected && {
                    borderColor: getColorHex(tag.color),
                    backgroundColor: `${getColorHex(tag.color)}10`
                  })
                }}
                onClick={() => handleTagToggle(tag)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: isSelected ? 'white' : getColorHex(tag.color) }}
                />
                {tag.name}
                {isSelected && <X className="h-3 w-3 ml-1" onClick={(e) => { e.stopPropagation(); handleTagToggle(tag);}} />}
              </Badge>
            );
          })}
        </div>
      )}

      <Dialog open={isManageModalOpen} onOpenChange={handleManageModalClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleManageModalClose}
                className="text-gray-500 hover:text-gray-700 mr-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <DialogTitle className="flex-1 text-center">{t("Manage Personality Tags")}</DialogTitle>
              <div className="w-10"></div>
            </div>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <PersonalityTagSettings />
          </div>
           <DialogFooter>
            <DialogClose asChild>
              <Button type="button" onClick={handleManageModalClose}>{t("Close")}</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper function to convert color names to hex values
const getColorHex = (colorName: string) => {
  const colorMap: { [key: string]: string } = {
    "blue": "#3B82F6",
    "purple": "#8B5CF6", 
    "red": "#EF4444",
    "green": "#22C55E",
    "orange": "#F97316",
    "yellow": "#EAB308",
    "pink": "#EC4899",
    "cyan": "#06B6D4",
    "indigo": "#6366F1",
    "gray": "#6B7280"
  };
  return colorMap[colorName] || "#6B7280";
};

export default PersonalityTagManager;
