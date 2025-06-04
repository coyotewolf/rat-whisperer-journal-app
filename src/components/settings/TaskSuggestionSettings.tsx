
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Pencil } from 'lucide-react';
import TaskSuggestionFormModal from './TaskSuggestionFormModal';
import { useTaskSuggestions, type TaskSuggestion } from '@/hooks/useTaskSuggestions';

const TaskSuggestionSettings = () => {
  const { suggestions, loading, deleteSuggestion } = useTaskSuggestions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<TaskSuggestion | null>(null);

  const openFormModal = (suggestionToEdit: TaskSuggestion | null = null) => {
    setEditingSuggestion(suggestionToEdit);
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingSuggestion(null);
  };

  const handleSaveSuggestion = (suggestionToSave: TaskSuggestion) => {
    // The suggestion is already saved via the hook
    closeFormModal();
  };

  const handleDeleteSuggestion = async (id: string) => {
    await deleteSuggestion(id);
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading...</div>;
  }

  return (
    <div className="relative p-4">
      <div className="absolute top-4 right-4">
        <Button onClick={() => openFormModal()} variant="ghost" size="icon" title="Add new suggestion">
          <PlusCircle className="h-6 w-6 text-gray-600 hover:text-gray-800" />
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">No quick suggestions yet. Click '+' to add one.</p>
      ) : (
        <ul className="space-y-3 mt-12">
          {suggestions.map(suggestion => (
            <li key={suggestion.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              <div>
                <p className="font-semibold text-gray-800">{suggestion.name}</p>
                <p className="text-xs text-gray-500">
                  {suggestion.title ? `Title: ${suggestion.title}` : 'No pre-filled title'}
                  {suggestion.priority && `, Priority: ${suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1)}`}
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="ghost" size="icon" onClick={() => openFormModal(suggestion)} title="Edit suggestion">
                  <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSuggestion(suggestion.id)} title="Delete suggestion">
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <TaskSuggestionFormModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        editingSuggestion={editingSuggestion}
        onSave={handleSaveSuggestion}
      />
    </div>
  );
};

export default TaskSuggestionSettings;
