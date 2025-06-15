
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Palette } from 'lucide-react';
import { useLogTagSuggestions } from '@/hooks/useLogTagSuggestions';

const defaultColors = [
  '#6B7280', '#EF4444', '#F97316', '#EAB308', '#22C55E', 
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'
];

interface AddLogTagSuggestionFormProps {
  onSuggestionAdded?: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  defaultCategory?: string;
  availableCategories?: string[];
}

export const AddLogTagSuggestionForm = ({ 
  onSuggestionAdded, 
  onCancel, 
  showCancelButton = false, 
  defaultCategory = 'behavior',
  availableCategories = ['behavior', 'health']
}: AddLogTagSuggestionFormProps) => {
  const { t } = useTranslation();
  const { addSuggestion } = useLogTagSuggestions();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addSuggestion(name, color, defaultCategory);
      setName('');
      setColor('#6B7280');
      if (onSuggestionAdded) {
        onSuggestionAdded();
      }
    } catch (error) {
      console.error('Error adding suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tagName">{t("Tag Name")}</Label>
        <Input
          id="tagName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("Enter tag name")}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>{t("Color")}</Label>
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <Palette className="h-4 w-4 text-white opacity-75" />
          </div>
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-16 h-8 p-0 border-0 rounded"
          />
        </div>
        <div className="flex flex-wrap gap-1">
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
        {showCancelButton && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="h-4 w-4 mr-1" />
            {t("Cancel")}
          </Button>
        )}
        <Button type="submit" disabled={!name.trim() || isSubmitting}>
          <Check className="h-4 w-4 mr-1" />
          {isSubmitting ? t("Adding...") : t("Add Tag")}
        </Button>
      </div>
    </form>
  );
};
