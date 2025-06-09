
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { PlusCircle, Settings2 as ManageIcon } from 'lucide-react';
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import TaskSuggestionFormModal from "./settings/TaskSuggestionFormModal";
import TaskSuggestionSettings from "./settings/TaskSuggestionSettings";
import { useTaskSuggestions, type TaskSuggestion } from "@/hooks/useTaskSuggestions";

interface TaskSuggestionsProps {
  onSelect: (suggestion: TaskSuggestion) => void;
  selectedSuggestionId?: string;
}

const TaskSuggestions = ({ onSelect, selectedSuggestionId }: TaskSuggestionsProps) => {
  const { t } = useTranslation();
  const { suggestions, loading } = useTaskSuggestions();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleSaveNewSuggestion = (newSuggestion: TaskSuggestion) => {
    // The suggestion is already saved via the hook
    setIsAddModalOpen(false);
  };

  const handleManageModalClose = () => {
    setIsManageModalOpen(false);
  };

  if (loading) {
    return <div className="text-sm text-gray-500">{t("Loading suggestions...")}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">{t("Quick suggestions:")}</p>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(true)} title={t("Add new suggestion")}>
            <PlusCircle className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsManageModalOpen(true)} title={t("Manage suggestions")}>
            <ManageIcon className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
        </div>
      </div>

      {suggestions.length === 0 ? (
         <p className="text-xs text-gray-500 py-2">{t("No quick suggestions yet. Click '+' to add one.")}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Badge
              key={suggestion.id}
              variant={selectedSuggestionId === suggestion.id ? "default" : "outline"}
              className={`cursor-pointer transition-colors border-2 ${
                selectedSuggestionId === suggestion.id
                  ? "bg-orange-500 text-white"
                  : "hover:bg-orange-100"
              }`}
              style={{ 
                borderColor: suggestion.color || '#6B7280',
                ...(selectedSuggestionId !== suggestion.id && {
                  backgroundColor: `${suggestion.color || '#6B7280'}10`
                })
              }}
              onClick={() => onSelect(suggestion)}
            >
              <div 
                className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: suggestion.color || '#6B7280' }}
              />
              {suggestion.name}
            </Badge>
          ))}
        </div>
      )}

      <TaskSuggestionFormModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        editingSuggestion={null}
        onSave={handleSaveNewSuggestion}
      />

      <Dialog open={isManageModalOpen} onOpenChange={handleManageModalClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("Manage Task Suggestions")}</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto">
            <TaskSuggestionSettings onBack={handleManageModalClose} />
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

export default TaskSuggestions;
