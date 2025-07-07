
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit2, Check, X, Palette } from 'lucide-react';
import { usePersonalityTags } from '@/hooks/usePersonalityTags';
import { AddPersonalityTagForm } from './AddPersonalityTagForm';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

interface PersonalityTagSettingsProps {
  onTagUpdated?: () => void;
}

const PersonalityTagSettings = ({ onTagUpdated }: PersonalityTagSettingsProps) => {
  const { t } = useTranslation();
  const { personalityTags, loading, updatePersonalityTag, deletePersonalityTag, refetch } = usePersonalityTags();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#6B7280');

  const handleEditStart = (tag: any) => {
    setEditingTag(tag.id);
    setEditName(tag.name);
    setEditColor(tag.color);
  };

  const handleEditSave = async (tagId: string) => {
    try {
      await updatePersonalityTag(tagId, editName, editColor);
      setEditingTag(null);
      await refetch(); // Refresh the data immediately
      onTagUpdated?.(); // Notify parent component
    } catch (error) {
      console.error('Error updating personality tag:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditName('');
    setEditColor('#6B7280');
  };

  const handleDelete = async (tagId: string) => {
    if (window.confirm(t('Are you sure you want to delete this personality tag?'))) {
      try {
        await deletePersonalityTag(tagId);
        await refetch(); // Refresh the data immediately
        onTagUpdated?.(); // Notify parent component
      } catch (error) {
        console.error('Error deleting personality tag:', error);
      }
    }
  };

  const handleTagAdded = async () => {
    await refetch(); // Refresh the data immediately
    onTagUpdated?.(); // Notify parent component
  };

  if (loading) {
    return <div className="text-center py-4">{t("Loading...")}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("Add New Personality Tag")}</h3>
        <AddPersonalityTagForm onTagAdded={handleTagAdded} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">{t("Existing Tags")}</h3>
        <div className="space-y-2">
          {personalityTags.map((tag) => (
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
                      style={{ backgroundColor: tag.color }}
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
                      onClick={() => handleDelete(tag.id)}
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
      </div>
    </div>
  );
};

export default PersonalityTagSettings;
