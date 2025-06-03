
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import TaskSuggestions from "./TaskSuggestions";
import type { TaskSuggestion } from "./settings/TaskSuggestionSettings"; // Import TaskSuggestion type
import TaskRepeatOptions from "./TaskRepeatOptions";
import type { RepeatOptions } from "./TaskRepeatOptions"; // Import RepeatOptions type

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  location?: string;
  quantity?: number;
  unit?: string;
  repeatOptions?: RepeatOptions; // Use imported RepeatOptions type
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
}

const TaskModal = ({ isOpen, onClose, task, onSave }: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | undefined>(); // Changed to store ID
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState<number>();
  const [unit, setUnit] = useState("");
  const [repeatOptions, setRepeatOptions] = useState<RepeatOptions>({ // Explicitly type with RepeatOptions
    type: 'none',
    weekdays: [],
    endDate: undefined,
    endType: 'never'
  });

  useEffect(() => {
    if (isOpen) { // Only run when modal is open
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        setDueDate(task.dueDate);
        setDueTime(task.dueTime);
        setPriority(task.priority);
        setLocation(task.location || "");
        setQuantity(task.quantity);
        setUnit(task.unit || "");
        setRepeatOptions(task.repeatOptions || {
          type: 'none',
          weekdays: [],
          endDate: undefined,
          endType: 'never'
        });
      } else {
        resetForm(); // Reset form for new task
      }
    }
  }, [isOpen, task]); // Depend on isOpen and task

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTitle("");
    setSelectedSuggestionId(undefined); // Reset ID
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
    setTitle(suggestion.title || suggestion.name); // Use suggestion.title or fallback to name
    setDescription(suggestion.description || "");
    setPriority(suggestion.priority || 'medium');
    setLocation(suggestion.location || "");
    setQuantity(suggestion.quantity);
    setUnit(suggestion.unit || "");
    // Note: dueDate and dueTime are not typically part of quick suggestions,
    // as they are usually set relative to the current date/time.
    // If you want to pre-fill them, add them to TaskSuggestion interface and set here.
    setSelectedSuggestionId(suggestion.id);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSelectedSuggestionId(undefined); // Clear selected suggestion if title is manually changed
  };

  const handleSave = () => {
    if (!title || !dueDate) return;

    const taskData = {
      title,
      description,
      dueDate,
      dueTime,
      priority,
      completed: false,
      location: location || undefined,
      quantity: quantity || undefined,
      unit: unit || undefined,
      repeatOptions: repeatOptions.type !== 'none' ? repeatOptions : undefined
    };

    if (task) {
      onSave({ ...taskData, id: task.id, completed: task.completed });
    } else {
      onSave(taskData);
    }

    // No need to reset form here, it's handled by useEffect when modal closes
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-md bg-background/80 border-0 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between"> {/* Changed to justify-between to accommodate back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1 text-center">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
            <div className="w-10"></div> {/* Placeholder to balance the back button */}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter task title"
            />
            {/* Render suggestions for both new and edit modes */}
            <TaskSuggestions
              onSelect={handleSuggestionSelect}
              selectedSuggestionId={selectedSuggestionId} // Pass ID
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="time"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Optional)</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity || ""}
                onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Amount"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit (Optional)</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, liters, etc."
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
            className="bg-orange-500 hover:bg-orange-600"
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
