
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PlusCircle, Palette, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePersonalityTags } from '@/hooks/usePersonalityTags';
import { useToast } from '@/hooks/use-toast';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

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
  const [newTagColor, setNewTagColor] = useState('#6B7280');
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
      setNewTagColor('#6B7280');
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
          <div 
            className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: newTagColor }}
          >
            <Palette className="h-3 w-3 text-white opacity-75" />
          </div>
          <Input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-8 h-8 p-0 border-0 rounded"
          />
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
      
      <div className="flex flex-wrap gap-1 ml-10">
        {defaultColors.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-5 h-5 rounded border ${newTagColor === color ? 'border-gray-800 border-2' : 'border-gray-300'}`}
            style={{ backgroundColor: color }}
            onClick={() => setNewTagColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default AddPersonalityTagForm;
