
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, X, Settings2 as ManageIcon, ArrowLeft } from 'lucide-react';
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLogTagSuggestions } from "@/hooks/useLogTagSuggestions";
import LogTagSuggestionSettings from "./settings/LogTagSuggestionSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { AddLogTagSuggestionForm } from "./settings/AddLogTagSuggestionForm";

interface LogTagSuggestionsProps {
  onSelect: (tagName: string) => void;
  selectedTags: string[];
  placeholder?: string;
  category?: string; // New prop to filter by category
}

const LogTagSuggestions = ({ onSelect, selectedTags, placeholder, category }: LogTagSuggestionsProps) => {
  const { t } = useTranslation();
  const { suggestions, loading, refreshSuggestions } = useLogTagSuggestions();
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  // Filter suggestions by category if provided
  const filteredSuggestions = useMemo(() => {
    if (!category) return suggestions;
    return suggestions.filter(suggestion => suggestion.category === category);
  }, [suggestions, category]);

  const handleManageModalClose = () => {
    setIsManageModalOpen(false);
    // Refresh suggestions when modal closes to pick up any newly added tags
    refreshSuggestions();
  };

  const handleQuickAddCompleted = () => {
    setShowQuickAdd(false);
    refreshSuggestions();
  }

  if (loading) {
    return <div className="text-sm text-gray-500">{t("Loading suggestions...")}</div>;
  }

  const categoryName = category ? t(category) : '';
  const displayPlaceholder = placeholder || (category ? t("Quick {{category}} suggestions:", { category: categoryName }) : t("Quick tag suggestions:"));

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">{displayPlaceholder}</p>
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowQuickAdd(prev => !prev)}
            title={t("Quick add suggestion")}
            className="text-green-600 hover:text-green-700"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setIsManageModalOpen(true)} title={t("Manage tag suggestions")}>
            <ManageIcon className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
        </div>
      </div>

      {showQuickAdd && (
        <div className="p-3 border rounded-lg bg-white shadow-sm">
          <AddLogTagSuggestionForm
            onSuggestionAdded={handleQuickAddCompleted}
            onCancel={() => setShowQuickAdd(false)}
            showCancelButton={true}
            defaultCategory={category}
          />
        </div>
      )}

      {filteredSuggestions.length === 0 && !showQuickAdd ? (
         <p className="text-xs text-gray-500 py-2">{category ? t("No {{category}} suggestions yet. Click 'Manage' to add one.", { category: categoryName }) : t("No quick tag suggestions yet. Click 'Manage' to add one.")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((suggestion) => {
            const isSelected = selectedTags.includes(suggestion.name);
            return (
              <Badge
                key={suggestion.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors border-2 ${
                  isSelected
                    ? "bg-orange-500 text-white"
                    : "hover:bg-orange-100"
                }`}
                style={{ 
                  borderColor: suggestion.color || '#6B7280',
                  ...(isSelected && {
                    backgroundColor: suggestion.color || '#6B7280',
                    borderColor: suggestion.color || '#6B7280'
                  }),
                  ...(!isSelected && {
                    backgroundColor: `${suggestion.color || '#6B7280'}10`
                  })
                }}
                onClick={() => onSelect(suggestion.name)}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: isSelected ? 'white' : (suggestion.color || '#6B7280') }}
                />
                {suggestion.name}
                {isSelected && <X className="h-3 w-3 ml-1" onClick={(e) => { e.stopPropagation(); onSelect(suggestion.name);}} />}
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
              <DialogTitle className="flex-1 text-center">{t("Manage Tag Suggestions")}</DialogTitle>
              <div className="w-10"></div>
            </div>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <LogTagSuggestionSettings />
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
