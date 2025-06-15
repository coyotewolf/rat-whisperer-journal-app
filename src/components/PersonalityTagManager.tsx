
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
                    ? "bg-orange-500 text-white border-orange-500"
                    : "hover:bg-gray-100 text-gray-700 border-gray-300"
                }`}
                style={{ 
                  ...(isSelected && {
                    backgroundColor: '#f97316',
                    borderColor: '#f97316'
                  }),
                  ...(!isSelected && {
                    borderColor: tag.color,
                    backgroundColor: `${tag.color}10`
                  })
                }}
                onClick={() => handleTagToggle(tag)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: isSelected ? 'white' : tag.color }}
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

export default PersonalityTagManager;
