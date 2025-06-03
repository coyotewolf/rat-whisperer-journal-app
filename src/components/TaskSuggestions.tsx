
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"; // Added DialogFooter
import { PlusCircle, Settings2 as ManageIcon } from 'lucide-react'; // Using Settings2 for manage icon
import { useState, useEffect, useCallback } from "react";
import TaskSuggestionFormModal from "./settings/TaskSuggestionFormModal";
import TaskSuggestionSettings, { STORAGE_KEY, TaskSuggestion } from "./settings/TaskSuggestionSettings"; // Import STORAGE_KEY and TaskSuggestion interface

interface TaskSuggestionsProps {
  onSelect: (suggestion: TaskSuggestion) => void;
  selectedSuggestionId?: string; // Changed to track by ID
}

const TaskSuggestions = ({ onSelect, selectedSuggestionId }: TaskSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const loadSuggestions = useCallback(() => {
    const storedSuggestions = localStorage.getItem(STORAGE_KEY);
    if (storedSuggestions) {
      setSuggestions(JSON.parse(storedSuggestions));
    } else {
      // If no suggestions in localStorage, TaskSuggestionSettings will seed defaults when it's first mounted.
      // We can also initialize with an empty array here, or let TaskSuggestionSettings handle it.
      // For consistency, if TaskSuggestionSettings seeds, this component should reflect that.
      // However, TaskSuggestionSettings seeds on its own mount.
      // For this component, if nothing is found, it means nothing is there yet or settings haven't run.
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    loadSuggestions();
    // Listen for custom event that signals suggestions have been updated elsewhere (e.g. in main settings)
    // This is a more robust way than relying on localStorage events which can be tricky.
    // For simplicity now, we'll re-load when the manage modal closes.
  }, [loadSuggestions]);


  const handleSaveNewSuggestion = (newSuggestion: TaskSuggestion) => {
    const currentSuggestions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as TaskSuggestion[];
    const updatedSuggestions = [...currentSuggestions, newSuggestion];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSuggestions));
    loadSuggestions(); // Reload suggestions to reflect the new one
    setIsAddModalOpen(false); // Close the add modal
     // Potentially add a toast message here for success
  };

  const handleManageModalClose = () => {
    setIsManageModalOpen(false);
    loadSuggestions(); // Reload suggestions when the management modal is closed
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm text-gray-600">Quick suggestions:</p>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(true)} title="Add new suggestion">
            <PlusCircle className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsManageModalOpen(true)} title="Manage suggestions">
            <ManageIcon className="h-5 w-5 text-orange-600 hover:text-orange-700" />
          </Button>
        </div>
      </div>

      {suggestions.length === 0 ? (
         <p className="text-xs text-gray-500 py-2">No quick suggestions yet. Click '+' to add one.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Badge
            key={suggestion.id}
            variant={selectedSuggestionId === suggestion.id ? "default" : "outline"}
            className={`cursor-pointer transition-colors ${
              selectedSuggestionId === suggestion.id
                ? "bg-orange-500 text-white"
                : "hover:bg-orange-100"
            }`}
            onClick={() => onSelect(suggestion)}
          >
            {suggestion.name} {/* Display suggestion.name */}
          </Badge>
        ))}
        </div>
      )}

      <TaskSuggestionFormModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        editingSuggestion={null} // Always for new suggestion from here
        onSave={handleSaveNewSuggestion}
      />

      <Dialog open={isManageModalOpen} onOpenChange={handleManageModalClose}>
        <DialogContent className="sm:max-w-xl"> {/* Adjusted width for a more compact, Apple-style modal */}
          <DialogHeader>
            <DialogTitle>Manage Task Suggestions</DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[70vh] overflow-y-auto"> {/* Scrollable content */}
            <TaskSuggestionSettings />
          </div>
           <DialogFooter>
            <DialogClose asChild>
              <Button type="button" onClick={handleManageModalClose}>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskSuggestions;
