
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Pencil, Check, X, Palette } from 'lucide-react';
import { LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { LogTagCategory } from '@/hooks/useLogTagCategories';
import { useToast } from '@/hooks/use-toast';

interface TagItemProps {
  suggestion: LogTagSuggestion;
  categories: LogTagCategory[];
  onUpdateSuggestion: (id: string, name: string, color: string, category: string) => Promise<void>;
  onDeleteSuggestion: (id: string) => Promise<void>;
}

export const TagItem = ({ 
  suggestion, 
  categories, 
  onUpdateSuggestion, 
  onDeleteSuggestion 
}: TagItemProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(suggestion.name);
  const [editingColor, setEditingColor] = useState(suggestion.color || '#6B7280');
  const [editingCategory, setEditingCategory] = useState(suggestion.category || 'general');

  const getCategoryDisplayName = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName);
    return category?.display_name || categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      toast({
        title: t("Error"),
        description: t("Tag name cannot be empty."),
        variant: "destructive",
      });
      return;
    }
    try {
      await onUpdateSuggestion(suggestion.id, editingName.trim(), editingColor, editingCategory);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tag suggestion:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingName(suggestion.name);
    setEditingColor(suggestion.color || '#6B7280');
    setEditingCategory(suggestion.category || 'general');
  };

  const handleDeleteClick = () => {
    if (window.confirm(t("Are you sure you want to delete this tag suggestion?"))) {
      onDeleteSuggestion(suggestion.id);
    }
  };

  if (isEditing) {
    return (
      <li className="flex justify-between items-center">
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
          <Select value={editingCategory} onValueChange={setEditingCategory}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSaveEdit(); }}
            className="text-sm flex-grow"
            autoFocus
          />
          <Button variant="ghost" size="icon" onClick={handleSaveEdit}>
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancelEdit}>
            <X className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div 
          className="w-4 h-4 rounded-full border border-gray-300"
          style={{ backgroundColor: suggestion.color || '#6B7280' }}
        />
        <p className="font-medium text-gray-800">{suggestion.name}</p>
      </div>
      <div className="space-x-2">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDeleteClick}>
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </li>
  );
};
