import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePersonalityTags, PersonalityTag } from '@/hooks/usePersonalityTags';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const colorOptions = [
  "blue",
  "purple", 
  "red",
  "green",
  "orange",
  "yellow",
  "pink",
  "gray",
  "indigo",
  "cyan",
];

const getThemedColorClasses = (colorName: string) => {
  switch (colorName) {
    case "primary": return "bg-primary/10 text-primary";
    case "secondary": return "bg-secondary/10 text-secondary-foreground";
    case "accent": return "bg-accent/10 text-accent-foreground";
    case "destructive": return "bg-destructive/10 text-destructive-foreground";
    case "muted": return "bg-muted/50 text-muted-foreground";
    case "blue": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    case "purple": return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    case "red": return "bg-red-500/10 text-red-600 dark:text-red-400";
    case "green": return "bg-green-500/10 text-green-600 dark:text-green-400";
    case "orange": return "bg-orange-500/10 text-orange-600 dark:text-orange-400";
    case "yellow": return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    case "pink": return "bg-pink-500/10 text-pink-600 dark:text-pink-400";
    case "cyan": return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400";
    case "indigo": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
    case "gray": return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    default: return "bg-muted/50 text-muted-foreground";
  }
};

const PersonalityTagSettings = () => {
  const { t } = useTranslation();
  const { 
    personalityTags: availableTags, 
    loading,
    addPersonalityTag, 
    updatePersonalityTag, 
    deletePersonalityTag 
  } = usePersonalityTags();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingColor, setEditingColor] = useState<string>(colorOptions[0]);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(colorOptions[0]);
  const [isAdding, setIsAdding] = useState(false);
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
    try {
      await updatePersonalityTag(id, editingName.trim(), editingColor);
      setEditingId(null);
      setEditingName('');
      setEditingColor(colorOptions[0]);
      toast({
        title: t("Success"),
        description: t("Personality tag updated successfully"),
      });
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
    setEditingColor(colorOptions[0]);
  };

  const handleAddTag = async () => {
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
      await addPersonalityTag(newTagName.trim(), newTagColor);
      setNewTagName("");
      setNewTagColor(colorOptions[0]);
      toast({
        title: t("Success"),
        description: t("Personality tag added successfully"),
      });
    } catch (error) {
      console.error('Error adding personality tag:', error);
      toast({
        title: t("Error"),
        description: t("Failed to add personality tag"),
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
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
      <div className="flex flex-col gap-2">
        <Input
          placeholder={t("Add new personality tag here")}
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') handleAddTag(); }}
          className="text-sm"
          disabled={isAdding}
        />
        <div className="space-y-2">
          <p className="text-sm font-medium">{t("Choose color:")}</p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <Badge
                key={`new-${color}`}
                variant="outline"
                className={cn(
                  `cursor-pointer`,
                  getThemedColorClasses(color),
                  newTagColor === color ? "ring-2 ring-primary" : ""
                )}
                onClick={() => setNewTagColor(color)}
              >
                {t("Sample")}
              </Badge>
            ))}
          </div>
        </div>
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!newTagName.trim() || isAdding}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {t("Add Tag")}
        </Button>
      </div>

      {availableTags.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">{t("No personality tags yet. Add one above.")}</p>
      ) : (
        <ul className="space-y-3 mt-4">
          {availableTags.map(tag => (
            <li key={tag.id} className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm">
              {editingId === tag.id ? (
                <div className="flex flex-col flex-grow mr-2 space-y-2">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSaveEdit(tag.id); }}
                    className="text-sm flex-grow"
                    autoFocus
                  />
                  <div className="space-y-2">
                    <p className="text-xs font-medium">{t("Choose color:")}</p>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <Badge
                          key={`edit-${tag.id}-${color}`}
                          variant="outline"
                          className={cn(
                            `cursor-pointer`,
                            getThemedColorClasses(color),
                            editingColor === color ? "ring-2 ring-primary" : ""
                          )}
                          onClick={() => setEditingColor(color)}
                        >
                          {t("Sample")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(tag.id)} title={t("Save")}>
                      <Check className="h-4 w-4 text-green-500 hover:text-green-700 mr-1" /> {t("Save")}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleCancelEdit} title={t("Cancel")}>
                      <X className="h-4 w-4 text-gray-500 hover:text-gray-700 mr-1" /> {t("Cancel")}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className={cn("font-semibold flex-grow", getThemedColorClasses(tag.color))}>{tag.name}</p>
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