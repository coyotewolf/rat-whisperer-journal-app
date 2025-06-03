import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"; // Removed DialogClose
import { ArrowLeft } from "lucide-react"; // Import ArrowLeft icon
import { TaskSuggestion } from './TaskSuggestionSettings'; // Import the interface
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface TaskSuggestionFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  editingSuggestion: TaskSuggestion | null;
  onSave: (suggestion: TaskSuggestion) => void;
  allSuggestions?: TaskSuggestion[]; // Optional: for validation or other logic if needed in the future
}

const TaskSuggestionFormModal = ({
  isOpen,
  onOpenChange,
  editingSuggestion,
  onSave,
}: TaskSuggestionFormModalProps) => {
  const [currentSuggestion, setCurrentSuggestion] = useState<Partial<TaskSuggestion>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (editingSuggestion) {
        setCurrentSuggestion({ ...editingSuggestion });
      } else {
        setCurrentSuggestion({ priority: 'medium' }); // Default for new suggestion
      }
    } else {
      // Reset form when modal is closed externally or by DialogClose
      setCurrentSuggestion({});
    }
  }, [isOpen, editingSuggestion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentSuggestion(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentSuggestion(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentSuggestion(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
  };

  const handleSubmit = () => {
    if (!currentSuggestion.name?.trim()) {
      toast({ title: "Error", description: "Suggestion name is required.", variant: "destructive" });
      return;
    }

    const suggestionToSave: TaskSuggestion = {
      id: editingSuggestion?.id || crypto.randomUUID(), // Use existing ID if editing, else generate new
      name: currentSuggestion.name.trim(),
      title: currentSuggestion.title,
      description: currentSuggestion.description,
      priority: currentSuggestion.priority || 'medium',
      location: currentSuggestion.location,
      quantity: currentSuggestion.quantity,
      unit: currentSuggestion.unit,
    };
    onSave(suggestionToSave);
    // onOpenChange(false); // Let the parent component handle closing and toast messages
  };

  const handleClose = () => {
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">{editingSuggestion ? 'Edit' : 'Add New'} Task Suggestion</DialogTitle>
            <div className="w-10"></div> {/* Placeholder to balance the back button */}
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="form-name">Suggestion Name (for the list)</Label>
            <Input id="form-name" name="name" value={currentSuggestion.name || ""} onChange={handleInputChange} placeholder="e.g., Daily Water Change" />
          </div>
          <div>
            <Label htmlFor="form-title">Pre-filled Task Title (Optional)</Label>
            <Input id="form-title" name="title" value={currentSuggestion.title || ""} onChange={handleInputChange} placeholder="e.g., Change Rat Water Bottles" />
          </div>
          <div>
            <Label htmlFor="form-description">Pre-filled Description (Optional)</Label>
            <Textarea id="form-description" name="description" value={currentSuggestion.description || ""} onChange={handleInputChange} placeholder="Task details..." />
          </div>
          <div>
            <Label htmlFor="form-priority">Pre-filled Priority (Optional)</Label>
            <Select name="priority" value={currentSuggestion.priority || 'medium'} onValueChange={(value) => handleSelectChange('priority', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="form-location">Pre-filled Location (Optional)</Label>
            <Input id="form-location" name="location" value={currentSuggestion.location || ""} onChange={handleInputChange} placeholder="e.g., Main Cage" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="form-quantity">Pre-filled Quantity (Optional)</Label>
              <Input id="form-quantity" name="quantity" type="number" value={currentSuggestion.quantity || ""} onChange={handleNumberInputChange} placeholder="e.g., 2" />
            </div>
            <div>
              <Label htmlFor="form-unit">Pre-filled Unit (Optional)</Label>
              <Input id="form-unit" name="unit" value={currentSuggestion.unit || ""} onChange={handleInputChange} placeholder="e.g., bottles" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{editingSuggestion ? 'Save Changes' : 'Add Suggestion'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskSuggestionFormModal;