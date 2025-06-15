
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLogTagSuggestions } from '@/hooks/useLogTagSuggestions';
import { useToast } from '@/hooks/use-toast';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

interface AddLogTagSuggestionFormProps {
  onSuggestionAdded?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  defaultCategory?: string;
}

export const AddLogTagSuggestionForm = ({ 
  onSuggestionAdded, 
  onCancel, 
  showCancelButton = false,
  defaultCategory = 'general'
}: AddLogTagSuggestionFormProps) => {
  const { t } = useTranslation();
  const { addSuggestion } = useLogTagSuggestions();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [category, setCategory] = useState(defaultCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: t("Error"),
        description: t("Tag name cannot be empty."),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addSuggestion(name.trim(), color, category);
      setName('');
      setColor('#6B7280');
      setCategory(defaultCategory);
      
      if (onSuggestionAdded) {
        onSuggestionAdded();
      }
    } catch (error) {
      console.error('Error adding tag suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tag-name">{t("Tag Name")}</Label>
        <Input
          id="tag-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("Enter tag name")}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag-category">{t("Category")}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder={t("Select category")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">{t("General")}</SelectItem>
            <SelectItem value="behavior">{t("Behavior")}</SelectItem>
            <SelectItem value="health">{t("Health")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tag-color">{t("Color")}</Label>
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <Input
            id="tag-color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-8 p-0 border-0"
          />
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {defaultColors.map((defaultColor) => (
            <button
              key={defaultColor}
              type="button"
              className={`w-6 h-6 rounded border ${color === defaultColor ? 'border-gray-800 border-2' : 'border-gray-300'}`}
              style={{ backgroundColor: defaultColor }}
              onClick={() => setColor(defaultColor)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {showCancelButton && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("Cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("Adding...") : t("Add Suggestion")}
        </Button>
      </div>
    </form>
  );
};
