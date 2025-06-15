
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLogTagSuggestions, type LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { useToast } from '@/hooks/use-toast';
import { AddLogTagSuggestionForm } from './AddLogTagSuggestionForm';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

const LogTagSuggestionSettings = () => {
  const { t } = useTranslation();
  const { suggestions, loading, updateSuggestion, deleteSuggestion, refreshSuggestions } = useLogTagSuggestions();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingColor, setEditingColor] = useState<string>('#6B7280');
  const [editingCategory, setEditingCategory] = useState<string>('general');

  // Group suggestions by category
  const groupedSuggestions = useMemo(() => {
    const groups: Record<string, LogTagSuggestion[]> = {};
    suggestions.forEach(suggestion => {
      const category = suggestion.category || 'general';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(suggestion);
    });
    return groups;
  }, [suggestions]);

  const handleEditClick = (suggestion: LogTagSuggestion) => {
    setEditingId(suggestion.id);
    setEditingName(suggestion.name);
    setEditingColor(suggestion.color || '#6B7280');
    setEditingCategory(suggestion.category || 'general');
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
      await updateSuggestion(id, editingName.trim(), editingColor, editingCategory);
      setEditingId(null);
      setEditingName('');
      setEditingColor('#6B7280');
      setEditingCategory('general');
    } catch (error) {
      console.error('Error updating tag suggestion:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#6B7280');
    setEditingCategory('general');
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (window.confirm(t("Are you sure you want to delete this tag suggestion?"))) {
      try {
        await deleteSuggestion(id);
      } catch (error) {
        console.error('Error deleting tag suggestion:', error);
      }
    }
  };

  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case 'behavior':
        return t('Behavior');
      case 'health':
        return t('Health');
      case 'general':
      default:
        return t('General');
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{t("Loading...")}</div>;
  }

  return (
    <div className="space-y-6">
      <AddLogTagSuggestionForm onSuggestionAdded={refreshSuggestions} />

      {Object.keys(groupedSuggestions).length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No tag suggestions yet. Add one above.")}</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSuggestions).map(([category, categoryTags]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                {getCategoryDisplayName(category)} ({categoryTags.length})
              </h3>
              <ul className="space-y-3">
                {categoryTags.map(suggestion => (
                  <li key={suggestion.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
                    {editingId === suggestion.id ? (
                      <div className="flex flex-col gap-2 flex-grow mr-2">
                        <div className="flex items-center gap-2">
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
                          <Select value={editingCategory} onValueChange={setEditingCategory}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">{t("General")}</SelectItem>
                              <SelectItem value="behavior">{t("Behavior")}</SelectItem>
                              <SelectItem value="health">{t("Health")}</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <div className="flex flex-wrap gap-1 ml-10">
                          {defaultColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              className={`w-5 h-5 rounded border ${editingColor === color ? 'border-gray-800 border-2' : 'border-gray-300'}`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditingColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 flex-grow">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: suggestion.color || '#6B7280' }}
                        />
                        <p className="font-semibold text-gray-800">{suggestion.name}</p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getCategoryDisplayName(suggestion.category || 'general')}
                        </span>
                      </div>
                    )}
                    <div className="space-x-2 flex-shrink-0">
                      {editingId !== suggestion.id && (
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(suggestion)} title={t("Edit tag suggestion")}>
                          <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSuggestion(suggestion.id)} title={t("Delete tag suggestion")}>
                        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogTagSuggestionSettings;
