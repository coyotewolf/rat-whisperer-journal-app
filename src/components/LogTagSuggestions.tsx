
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, X, Settings2 as ManageIcon, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLogTagSuggestions, type LogTagSuggestion } from "@/hooks/useLogTagSuggestions";
import LogTagSuggestionSettings from "./settings/LogTagSuggestionSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"; // For Manage Modal

interface LogTagSuggestionsProps {
  onSelect: (tagName: string) => void;
  selectedTags: string[];
}

const LogTagSuggestions = ({ onSelect, selectedTags }: LogTagSuggestionsProps) => {
  const { t } = useTranslation();
  const { suggestions, loading, deleteSuggestion } = useLogTagSuggestions(); // Removed addSuggestion as it's now handled in settings
  const [isManageModalOpen, setIsManageModalOpen] = useState(false); // Removed isAddModalOpen

  // Removed handleSaveNewSuggestion as adding is now inline in settings

  const handleManageModalClose = () => {
    setIsManageModalOpen(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">{t("Loading suggestions...")}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">{t("Quick tag suggestions:")}</p>
        <div className="flex items-center space-x-2">
          {/* Removed Add button as adding is now inline in settings */}
          <Button type="button" variant="ghost" size="icon" onClick={() => setIsManageModalOpen(true)} title={t("Manage tag suggestions")}>
            <ManageIcon className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
        </div>
      </div>

      {suggestions.length === 0 ? (
         <p className="text-xs text-gray-500 py-2">{t("No quick tag suggestions yet. Click 'Manage' to add one.")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => {
            const isSelected = selectedTags.includes(suggestion.name);
            return (
              <Badge
                key={suggestion.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-orange-500 text-white"
                    : "hover:bg-orange-100"
                }`}
                onClick={() => onSelect(suggestion.name)}
              >
                {suggestion.name}
                {/* Retaining X for multi-select, as discussed */}
                {isSelected && <X className="h-3 w-3 ml-1" onClick={(e) => { e.stopPropagation(); onSelect(suggestion.name);}} />}
              </Badge>
            );
          })}
        </div>
      )}

      {/* Removed LogTagSuggestionFormModal */}

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
              <DialogTitle className="flex-1 text-center">{t("Manage Tag Suggestions")}</DialogTitle>
              <div className="w-10"></div> {/* Spacer to balance the back button */}
            </div>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <LogTagSuggestionSettings /> {/* onBack prop is no longer needed here */}
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

export default LogTagSuggestions;
