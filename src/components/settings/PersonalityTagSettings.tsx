
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePersonalityTags, PersonalityTag } from '@/hooks/usePersonalityTags';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { AddPersonalityTagForm } from './AddPersonalityTagForm';
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
    updatePersonalityTag, 
    deletePersonalityTag 
  } = usePersonalityTags();
  const { toast } = useToast();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [editingColor, setEditingColor] = useState<string>(colorOptions[0]);
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
      <AddPersonalityTagForm />

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
                <div className="flex items-center gap-3 flex-grow">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: getColorHex(tag.color) }}
                  />
                  <p className={cn("font-semibold", getThemedColorClasses(tag.color))}>{tag.name}</p>
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

// Helper function to convert color names to hex values
const getColorHex = (colorName: string) => {
  const colorMap: { [key: string]: string } = {
    "blue": "#3B82F6",
    "purple": "#8B5CF6", 
    "red": "#EF4444",
    "green": "#22C55E",
    "orange": "#F97316",
    "yellow": "#EAB308",
    "pink": "#EC4899",
    "cyan": "#06B6D4",
    "indigo": "#6366F1",
    "gray": "#6B7280"
  };
  return colorMap[colorName] || "#6B7280";
};

export default PersonalityTagSettings;
