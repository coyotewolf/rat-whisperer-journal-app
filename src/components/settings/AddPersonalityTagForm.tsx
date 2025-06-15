
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePersonalityTags } from '@/hooks/usePersonalityTags';
import { useToast } from '@/hooks/use-toast';
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

interface AddPersonalityTagFormProps {
  onTagAdded?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export const AddPersonalityTagForm = ({ onTagAdded, onCancel, showCancelButton = false }: AddPersonalityTagFormProps) => {
  const { t } = useTranslation();
  const { addPersonalityTag } = usePersonalityTags();
  const { toast } = useToast();

  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(colorOptions[0]);
  const [isAdding, setIsAdding] = useState(false);

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
      if (onTagAdded) {
        onTagAdded();
      }
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

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t("Add new personality tag here")}
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleAddTag(); }}
            className="text-sm flex-1"
            disabled={isAdding}
            autoFocus
          />
        </div>
        <Button
          type="button"
          onClick={handleAddTag}
          disabled={!newTagName.trim() || isAdding}
          variant="outline"
          size="sm"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
        {showCancelButton && onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-1 ml-2">
        {colorOptions.map((color) => (
          <Badge
            key={color}
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
  );
};

export default AddPersonalityTagForm;
