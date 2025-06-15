
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLogTagSuggestions, type LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { useToast } from '@/hooks/use-toast';
import { AddLogTagSuggestionForm } from './AddLogTagSuggestionForm';

const LogTagSuggestionSettings = () => {
  const { t } = useTranslation();
  const { suggestions, loading, updateSuggestion, deleteSuggestion, refreshSuggestions } = useLogTagSuggestions();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingColor, setEditingColor] = useState<string>('#6B7280');

  const handleEditClick = (suggestion: LogTagSuggestion) => {
    setEditingId(suggestion.id);
    setEditingName(suggestion.name);
    setEditingColor(suggestion.color || '#6B7280');
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
      await updateSuggestion(id, editingName.trim(), editingColor);
      setEditingId(null);
      setEditingName('');
      setEditingColor('#6B7280');
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
    setEditingColor('#6B7280');
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
      <AddLogTagSuggestionForm onSuggestionAdded={refreshSuggestions} />

      {suggestions.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No quick behavior suggestions yet. Add one above.")}</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {suggestions.map(suggestion => (
            <li key={suggestion.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              {editingId === suggestion.id ? (
                <div className="flex items-center gap-2 flex-grow mr-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: editingColor }}
                  >
                    <Palette className="h-3 w-3 text-white opacity-75" />
                  </div>
                  <Input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded"
                  />
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
                <div className="flex items-center gap-3 flex-grow">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: suggestion.color || '#6B7280' }}
                  />
                  <p className="font-semibold text-gray-800">{suggestion.name}</p>
                </div>
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
