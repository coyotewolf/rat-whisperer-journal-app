import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLogTagSuggestions, type LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { useToast } from '@/hooks/use-toast'; // For toast messages

interface LogTagSuggestionSettingsProps {
  // onBack: () => void; // Removed as it's handled by parent Dialog
}

const LogTagSuggestionSettings = (/* { onBack }: LogTagSuggestionSettingsProps */) => {
  const { t } = useTranslation();
  const { suggestions, loading, addSuggestion, updateSuggestion, deleteSuggestion } = useLogTagSuggestions();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [newTagName, setNewTagName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleEditClick = (suggestion: LogTagSuggestion) => {
    setEditingId(suggestion.id);
    setEditingName(suggestion.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) {
      toast({
        title: t("Error"),
        description: t("Tag name cannot be empty."),
        variant: "destructive",
      });
      return;
    }
    try {
      await updateSuggestion(id, editingName.trim());
      setEditingId(null);
      setEditingName('');
      toast({
        title: t("Success"),
        description: t("Tag suggestion updated successfully"),
      });
    } catch (error) {
      console.error('Error updating tag suggestion:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update tag suggestion"),
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleAddSuggestion = async () => {
    if (!newTagName.trim()) {
      toast({
        title: t("Error"),
        description: t("Tag name cannot be empty."),
        variant: "destructive",
      });
      return;
    }
    setIsAdding(true);
    try {
      await addSuggestion(newTagName.trim());
      setNewTagName("");
      toast({
        title: t("Success"),
        description: t("Tag suggestion added successfully"),
      });
    } catch (error) {
      console.error('Error adding tag suggestion:', error);
      toast({
        title: t("Error"),
        description: t("Failed to add tag suggestion"),
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (window.confirm(t("Are you sure you want to delete this tag suggestion?"))) {
      try {
        await deleteSuggestion(id);
        toast({
          title: t("Success"),
          description: t("Tag suggestion deleted successfully"),
        });
      } catch (error) {
        console.error('Error deleting tag suggestion:', error);
        toast({
          title: t("Error"),
          description: t("Failed to delete tag suggestion"),
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{t("Loading...")}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Removed the back button from here as it's now in the parent DialogHeader */}

      <div className="flex gap-2 items-center">
        <Input
          placeholder={t("Add new behavior suggestion here")}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') handleAddSuggestion(); }}
          className="text-sm"
          disabled={isAdding}
        />
        <Button
          type="button"
          onClick={handleAddSuggestion}
          disabled={!newTagName.trim() || isAdding}
          variant="outline"
          size="sm"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No quick behavior suggestions yet. Add one above.")}</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {suggestions.map(suggestion => (
            <li key={suggestion.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              {editingId === suggestion.id ? (
                <div className="flex items-center flex-grow mr-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSaveEdit(suggestion.id); }}
                    className="text-sm flex-grow"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(suggestion.id)} title={t("Save")}>
                    <Check className="h-4 w-4 text-green-500 hover:text-green-700" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={handleCancelEdit} title={t("Cancel")}>
                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                </div>
              ) : (
                <p className="font-semibold text-gray-800 flex-grow">{suggestion.name}</p>
              )}
              <div className="space-x-2 flex-shrink-0">
                {editingId !== suggestion.id && (
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(suggestion)} title={t("Edit behavior suggestion")}>
                    <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDeleteSuggestion(suggestion.id)} title={t("Delete behavior suggestion")}>
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LogTagSuggestionSettings;