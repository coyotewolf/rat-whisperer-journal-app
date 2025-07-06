
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, ArrowLeft, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import TaskSuggestions from "./TaskSuggestions";
import type { TaskSuggestion } from "@/hooks/useTaskSuggestions";
import TaskRepeatOptions from "./TaskRepeatOptions";
import type { RepeatOptions } from "./TaskRepeatOptions";
import type { Task } from "@/hooks/useTasks";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'> | Task) => void;
  onDelete: (taskId: string) => void; // New prop for delete functionality
}

const TaskModal = ({ isOpen, onClose, task, onSave, onDelete }: TaskModalProps) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | undefined>();
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState<number>();
  const [unit, setUnit] = useState("");
  const [repeatOptions, setRepeatOptions] = useState<RepeatOptions>({
    type: 'none',
    weekdays: [],
    endDate: undefined,
    endType: 'never'
  });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false); // State for delete confirmation dialog

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(new Date(task.due_date));
        setDueTime(task.due_time || "");
        setPriority(task.priority);
        setLocation(task.location || "");
        setQuantity(task.quantity);
        setUnit(task.unit || "");
        setRepeatOptions(task.repeat_options || {
          type: 'none',
          weekdays: [],
          endDate: undefined,
          endType: 'never'
        });
      } else {
        resetForm();
      }
    }
  }, [isOpen, task]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setSelectedSuggestionId(undefined);
    setDescription("");
    setDueDate(undefined);
    setDueTime("");
    setPriority('medium');
    setLocation("");
    setQuantity(undefined);
    setUnit("");
    setRepeatOptions({
      type: 'none',
      weekdays: [],
      endDate: undefined,
      endType: 'never'
    });
  };

  const handleSuggestionSelect = (suggestion: TaskSuggestion) => {
    setTitle(suggestion.title || suggestion.name);
    setDescription(suggestion.description || "");
    setPriority(suggestion.priority || 'medium');
    setLocation(suggestion.location || "");
    setQuantity(suggestion.quantity);
    setUnit(suggestion.unit || "");
    setSelectedSuggestionId(suggestion.id);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSelectedSuggestionId(undefined);
  };

  const handleSave = () => {
    if (!title || !dueDate) return;

    const taskData = {
      title,
      description,
      due_date: dueDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
      due_time: dueTime || null,
      priority,
      completed: false,
      location: location || undefined,
      quantity: quantity || undefined,
      unit: unit || undefined,
      repeat_options: repeatOptions.type !== 'none' ? repeatOptions : undefined
    };

    if (task) {
      onSave({ ...taskData, id: task.id, completed: task.completed, created_at: task.created_at, updated_at: task.updated_at });
    } else {
      onSave(taskData);
    }

    onClose();
  };

  const handleDeleteClick = () => {
    if (task?.id) {
      onDelete(task.id);
      setDeleteConfirmOpen(false);
      onClose(); // Close the task modal after deletion
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card text-card-foreground border border-border shadow-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">{task ? t('Edit Task') : t('New Task')}</DialogTitle>
            {task && ( // Only show delete button if in edit mode
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                      aria-label={t("Delete Task")}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("Delete Task")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {!task && <div className="w-10"></div>} {/* Placeholder for alignment if not in edit mode */}
          </div>
        </DialogHeader>
        
        <div className="space-y-4 text-foreground">
          <div className="space-y-2">
            <Label htmlFor="title">{t("Task Title")}</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder={t("Enter task title")}
              className="bg-input text-foreground border-border"
            />
            <TaskSuggestions
              onSelect={handleSuggestionSelect}
              selectedSuggestionId={selectedSuggestionId}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("Description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("Enter task description")}
              rows={3}
              className="bg-input text-foreground border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t("Due Date")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-input text-foreground border-border hover:bg-accent hover:text-accent-foreground",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : t("Pick a date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover text-popover-foreground border-border">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className="bg-card text-card-foreground"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">{t("Time")}</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10 bg-input text-foreground border-border"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("Priority")}</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger className="bg-input text-foreground border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                <SelectItem value="low">{t("Low Priority")}</SelectItem>
                <SelectItem value="medium">{t("Medium Priority")}</SelectItem>
                <SelectItem value="high">{t("High Priority")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">{t("Location (Optional)")}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t("Enter location")}
                className="pl-10 bg-input text-foreground border-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t("Quantity (Optional)")}</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity || ""}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
                placeholder={t("Amount")}
                className="bg-input text-foreground border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t("Unit (Optional)")}</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder={t("kg, liters, etc.")}
                className="bg-input text-foreground border-border"
              />
            </div>
          </div>

          {!task && (
            <TaskRepeatOptions
              repeatOptions={repeatOptions}
              onRepeatChange={setRepeatOptions}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={!title || !dueDate}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {task ? t('Update Task') : t('Create Task')}
          </Button>
        </div>
      </DialogContent>

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteClick}
        title={t("Delete Task")}
        description={t("Are you sure you want to delete this task? This action cannot be undone.")}
        confirmText={t("Delete")}
        variant="destructive"
      />
    </Dialog>
  );
};

export default TaskModal;
