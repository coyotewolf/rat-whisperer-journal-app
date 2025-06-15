
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePersonalityTags, PersonalityTag } from '@/hooks/usePersonalityTags';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AddPersonalityTagForm } from './AddPersonalityTagForm';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<PersonalityTag | null>(null);

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
    
    const success = await updatePersonalityTag(id, editingName.trim(), editingColor);
    if (success) {
      setEditingId(null);
      setEditingName('');
      setEditingColor('#6B7280');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
    setEditingColor('#6B7280');
  };

  const handleDeleteTag = async () => {
    if (tagToDelete) {
      try {
        await deletePersonalityTag(tagToDelete.id);
        toast({
          title: t("Success"),
          description: t("Personality tag deleted successfully"),
        });
      } catch (error) {
        console.error('Error deleting personality tag:', error);
        toast({
          title: t("Error"),
          description: t("Failed to delete personality tag"),
          variant: "destructive",
        });
      } finally {
        setTagToDelete(null);
        setShowDeleteConfirm(false);
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
                <div className="flex items-center gap-2 flex-grow mr-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: editingColor }}
                  />
                  <Input
                    type="color"
                    value={editingColor}
                    onChange={(e) => setEditingColor(e.target.value)}
                    className="w-12 h-8 p-1 border rounded cursor-pointer"
                    title={t("Choose color")}
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
                <Button variant="ghost" size="icon" onClick={() => {
                  setTagToDelete(tag);
                  setShowDeleteConfirm(true);
                }} title={t("Delete personality tag")}>
                  <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTag}
        title={t("Delete Personality Tag")}
        description={t("Are you sure you want to delete the tag '{{tagName}}'? This action cannot be undone.", { tagName: tagToDelete?.name })}
        confirmText={t("Delete")}
        cancelText={t("Cancel")}
        variant="destructive"
      />
    </div>
  );
};

export default PersonalityTagSettings;
