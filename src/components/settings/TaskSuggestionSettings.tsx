
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Pencil, ArrowLeft } from 'lucide-react';
import TaskSuggestionFormModal from './TaskSuggestionFormModal';
import { useTaskSuggestions, type TaskSuggestion } from '@/hooks/useTaskSuggestions';

interface TaskSuggestionSettingsProps {
  onBack: () => void;
}

const TaskSuggestionSettings = ({ onBack }: TaskSuggestionSettingsProps) => {
  const { t } = useTranslation();
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
    return <div className="text-center py-8 text-gray-500">{t("Loading...")}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("Back to Settings")}
        </Button>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => openFormModal()} variant="ghost" size="icon" title={t("Add new suggestion")}>
          <PlusCircle className="h-6 w-6 text-gray-600 hover:text-gray-800" />
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No quick suggestions yet. Click '+' to add one.")}</p>
      ) : (
        <ul className="space-y-3 mt-12">
          {suggestions.map(suggestion => (
            <li key={suggestion.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              <div>
                <p className="font-semibold text-gray-800">{suggestion.name}</p>
                <p className="text-xs text-gray-500">
                  {suggestion.title ? t("Title: {{title}}", { title: suggestion.title }) : t('No pre-filled title')}
                  {suggestion.priority && t(", Priority: {{priority}}", { priority: suggestion.priority.charAt(0).toUpperCase() + suggestion.priority.slice(1) })}
                </p>
              </div>
              <div className="space-x-2">
                <Button variant="ghost" size="icon" onClick={() => openFormModal(suggestion)} title={t("Edit suggestion")}>
                  <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSuggestion(suggestion.id)} title={t("Delete suggestion")}>
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
