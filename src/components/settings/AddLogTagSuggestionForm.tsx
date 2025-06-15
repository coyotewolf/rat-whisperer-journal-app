import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Palette, PlusCircle } from 'lucide-react';
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

  const handleAddTag = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addSuggestion(name.trim(), color, defaultCategory);
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

  // If it's used in the quick add context (showCancelButton = true), use the inline style
  if (showCancelButton) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2 flex-1">
            <div 
              className="w-6 h-6 rounded-full border border-gray-300 cursor-pointer flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              <Palette className="h-3 w-3 text-white opacity-75" />
            </div>
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 p-0 border-0 rounded"
            />
            <Input
              placeholder={t("Add new tag here")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleAddTag(); }}
              className="text-sm flex-1"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <Button
            type="button"
            onClick={handleAddTag}
            disabled={!name.trim() || isSubmitting}
            variant="outline"
            size="sm"
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          {onCancel && (
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
          {defaultColors.map((defaultColor) => (
            <button
              key={defaultColor}
              type="button"
              className={`w-5 h-5 rounded border ${color === defaultColor ? 'border-gray-800 border-2' : 'border-gray-300'}`}
              style={{ backgroundColor: defaultColor }}
              onClick={() => setColor(defaultColor)}
            />
          ))}
        </div>
      </div>
    );
  }

  // For the settings modal, keep the original form style
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("Enter tag name")}
          required
        />
      </div>
      
      <div className="space-y-2">
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
        <Button type="submit" disabled={!name.trim() || isSubmitting}>
          <PlusCircle className="h-4 w-4 mr-1" />
          {isSubmitting ? t("Adding...") : t("Add Tag")}
        </Button>
      </div>
    </form>
  );
};
