
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { useTaskSuggestions, type TaskSuggestion } from '@/hooks/useTaskSuggestions';

interface TaskSuggestionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingSuggestion: TaskSuggestion | null;
  onSave: (suggestion: TaskSuggestion) => void;
}

const TaskSuggestionFormModal = ({
  isOpen,
  onOpenChange,
  editingSuggestion,
  onSave
}: TaskSuggestionFormModalProps) => {
  const { t } = useTranslation();
  const { createSuggestion, updateSuggestion } = useTaskSuggestions();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | ''>('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState<number | undefined>();
  const [unit, setUnit] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingSuggestion) {
        setName(editingSuggestion.name);
        setTitle(editingSuggestion.title || '');
        setDescription(editingSuggestion.description || '');
        setPriority(editingSuggestion.priority || '');
        setLocation(editingSuggestion.location || '');
        setQuantity(editingSuggestion.quantity);
        setUnit(editingSuggestion.unit || '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, editingSuggestion]);

  const resetForm = () => {
    setName('');
    setTitle('');
    setDescription('');
    setPriority('');
    setLocation('');
    setQuantity(undefined);
    setUnit('');
  };

  const handleSave = async () => {
    if (!name) return;

    const suggestionData = {
      name,
      title: title || undefined,
      description: description || undefined,
      priority: priority || undefined,
      location: location || undefined,
      quantity: quantity || undefined,
      unit: unit || undefined,
    };

    try {
      let savedSuggestion;
      if (editingSuggestion) {
        savedSuggestion = await updateSuggestion(editingSuggestion.id, suggestionData);
      } else {
        savedSuggestion = await createSuggestion(suggestionData);
      }
      
      if (savedSuggestion) {
        onSave(savedSuggestion);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving suggestion:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-md bg-background/80 border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">
              {editingSuggestion ? t('Edit Task Suggestion') : t('New Task Suggestion')}
            </DialogTitle>
            <div className="w-10"></div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("Suggestion Name")} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("Display name for the suggestion")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">{t("Pre-filled Task Title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t("Optional task title to pre-fill")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("Description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Optional description")}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t("Priority")}</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t("Select priority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("Low Priority")}</SelectItem>
                <SelectItem value="medium">{t("Medium Priority")}</SelectItem>
                <SelectItem value="high">{t("High Priority")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t("Location")}</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("Optional location")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t("Quantity")}</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity || ""}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={t("Amount")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t("Unit")}</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t("kg, liters, etc.")}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={!name}
            className="bg-orange-500 hover:bg-orange-600"
          >
            {editingSuggestion ? t('Update Suggestion') : t('Create Suggestion')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskSuggestionFormModal;
