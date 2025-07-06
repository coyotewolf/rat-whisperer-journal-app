
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X, Palette } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePersonalityTags, PersonalityTag } from '@/hooks/usePersonalityTags';
import { useToast } from '@/hooks/use-toast';
import { AddPersonalityTagForm } from './AddPersonalityTagForm';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

const PersonalityTagSettings = () => {
  const { t } = useTranslation();
  const { 
    personalityTags: availableTags, 
    loading,
    updatePersonalityTag, 
    deletePersonalityTag,
    refetch
  } = usePersonalityTags();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingColor, setEditingColor] = useState<string>('#6B7280');

  const handleEditClick = (tag: PersonalityTag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditingColor(tag.color);
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
      console.log('Saving tag with color:', editingColor); // Debug log
      const success = await updatePersonalityTag(id, editingName.trim(), editingColor);
      
      if (success) {
        setEditingId(null);
        setEditingName('');
        setEditingColor('#6B7280');
        // Force a refetch to ensure UI is in sync with database
        await refetch();
      }
    } catch (error) {
      console.error('Error updating personality tag:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update personality tag"),
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#6B7280');
  };

  const handleDeleteTag = async (tag: PersonalityTag) => {
    if (window.confirm(t("Are you sure you want to delete the tag '{{tagName}}'? This action cannot be undone.", { tagName: tag.name }))) {
      try {
        await deletePersonalityTag(tag.id);
      } catch (error) {
        console.error('Error deleting personality tag:', error);
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-500">{t("Loading...")}</div>;
  }

  return (
    <div className="space-y-4">
      <AddPersonalityTagForm onTagAdded={refetch} />

      {availableTags.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No personality tags yet. Add one above.")}</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {availableTags.map(tag => (
            <li key={tag.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              {editingId === tag.id ? (
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
                      onChange={(e) => {
                        console.log('Color changed to:', e.target.value); // Debug log
                        setEditingColor(e.target.value);
                      }}
                      className="w-8 h-8 p-0 border-0 rounded"
                    />
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleSaveEdit(tag.id); }}
                      className="text-sm flex-grow"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleSaveEdit(tag.id)} title={t("Save")}>
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
                        onClick={() => {
                          console.log('Preset color clicked:', color); // Debug log
                          setEditingColor(color);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-grow">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <p className="font-semibold text-gray-800">{tag.name}</p>
                </div>
              )}
              <div className="space-x-2 flex-shrink-0">
                {editingId !== tag.id && (
                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(tag)} title={t("Edit personality tag")}>
                    <Pencil className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDeleteTag(tag)} title={t("Delete personality tag")}>
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

export default PersonalityTagSettings;
