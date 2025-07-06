
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit2, Check, X, Palette } from 'lucide-react';
import { LogTagSuggestion } from '@/hooks/useLogTagSuggestions';
import { LogTagCategory } from '@/hooks/useLogTagCategories';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

interface CategoryTagListProps {
  tags: LogTagSuggestion[];
  categories: LogTagCategory[];
  onUpdateSuggestion: (id: string, name: string, color?: string, category?: string) => Promise<LogTagSuggestion>;
  onDeleteSuggestion: (id: string) => Promise<void>;
}

export const CategoryTagList = ({
  tags,
  categories,
  onUpdateSuggestion,
  onDeleteSuggestion
}: CategoryTagListProps) => {
  const { t } = useTranslation();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#6B7280');
  const [editCategory, setEditCategory] = useState('behavior');

  const handleEditStart = (tag: LogTagSuggestion) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color || '#6B7280');
    setEditCategory(tag.category || 'behavior');
  };

  const handleEditSave = async (tagId: string) => {
    try {
      await onUpdateSuggestion(tagId, editName, editColor, editCategory);
      setEditingTag(null);
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditName('');
    setEditColor('#6B7280');
    setEditCategory('behavior');
  };

  return (
    <div className="p-4 space-y-2">
      {tags.map((tag) => (
        <div key={tag.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          {editingTag === tag.id ? (
            <div className="flex-1 space-y-2">
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 flex-1">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: editColor }}
                  >
                    <Palette className="h-3 w-3 text-white opacity-75" />
                  </div>
                  <Input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded"
                  />
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-sm flex-1"
                    autoFocus
                  />
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditSave(tag.id)}
                    disabled={!editName.trim()}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditCancel}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1 ml-10">
                {defaultColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-5 h-5 rounded border ${editColor === color ? 'border-gray-800 border-2' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEditColor(color)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: tag.color || '#6B7280' }}
                />
                <span className="text-sm">{tag.name}</span>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditStart(tag)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteSuggestion(tag.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
