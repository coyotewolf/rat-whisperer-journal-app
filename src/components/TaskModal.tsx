
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CalendarIcon, Clock, MapPin, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  repeat?: {
    type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
    weekdays?: number[];
    endDate?: Date;
    indefinite: boolean;
  };
  location?: string;
  quantity?: number;
  unit?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSave: (task: Omit<Task, 'id'> | Task) => void;
}

const predefinedTitles = [
  "Cage cleaning",
  "Vet appointment", 
  "Bedding restock",
  "Food restock",
  "Feeding",
  "Water refill",
  "Playtime"
];

const weekdays = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
  { label: "Sun", value: 0 }
];

const TaskModal = ({ isOpen, onClose, task, onSave }: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<Date>();
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>('none');
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [repeatEndDate, setRepeatEndDate] = useState<Date>();
  const [indefiniteRepeat, setIndefiniteRepeat] = useState(true);
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState<number>();
  const [unit, setUnit] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(task.dueDate);
      setDueTime(task.dueTime);
      setPriority(task.priority);
      setRepeatType(task.repeat?.type || 'none');
      setSelectedWeekdays(task.repeat?.weekdays || []);
      setRepeatEndDate(task.repeat?.endDate);
      setIndefiniteRepeat(task.repeat?.indefinite ?? true);
      setLocation(task.location || "");
      setQuantity(task.quantity);
      setUnit(task.unit || "");
    } else {
      setTitle("");
      setDescription("");
      setDueDate(undefined);
      setDueTime("");
      setPriority('medium');
      setRepeatType('none');
      setSelectedWeekdays([]);
      setRepeatEndDate(undefined);
      setIndefiniteRepeat(true);
      setLocation("");
      setQuantity(undefined);
      setUnit("");
    }
  }, [task]);

  const handleWeekdayToggle = (weekday: number) => {
    setSelectedWeekdays(prev => 
      prev.includes(weekday) 
        ? prev.filter(w => w !== weekday)
        : [...prev, weekday]
    );
  };

  const handleSave = () => {
    if (!title || !dueDate) return;

    const taskData: Omit<Task, 'id'> = {
      title,
      description,
      dueDate,
      dueTime,
      priority,
      completed: false,
      repeat: repeatType !== 'none' ? {
        type: repeatType,
        weekdays: repeatType === 'custom' ? selectedWeekdays : undefined,
        endDate: !indefiniteRepeat ? repeatEndDate : undefined,
        indefinite: indefiniteRepeat
      } : undefined,
      location: location || undefined,
      quantity: quantity || undefined,
      unit: unit || undefined
    };

    if (task) {
      onSave({ ...taskData, id: task.id, completed: task.completed });
    } else {
      onSave(taskData);
    }

    onClose();
  };

  const openLocationInMaps = () => {
    if (location) {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white/95 backdrop-blur-sm border-white/20">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg bg-gray-100 hover:bg-gray-200 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {predefinedTitles.map((predefinedTitle) => (
                <Button
                  key={predefinedTitle}
                  variant="outline"
                  size="sm"
                  onClick={() => setTitle(predefinedTitle)}
                  className="text-xs rounded-full bg-gray-100 hover:bg-orange-100 border-gray-300"
                >
                  {predefinedTitle}
                </Button>
              ))}
            </div>
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
            <Label>Repeat</Label>
            <Select value={repeatType} onValueChange={(value: typeof repeatType) => setRepeatType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom Days</SelectItem>
              </SelectContent>
            </Select>

            {repeatType === 'custom' && (
              <div className="space-y-2">
                <Label>Select Days</Label>
                <div className="flex gap-2 flex-wrap">
                  {weekdays.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${day.value}`}
                        checked={selectedWeekdays.includes(day.value)}
                        onCheckedChange={() => handleWeekdayToggle(day.value)}
                      />
                      <Label htmlFor={`day-${day.value}`} className="text-sm">{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {repeatType !== 'none' && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="indefinite"
                    checked={indefiniteRepeat}
                    onCheckedChange={(checked) => setIndefiniteRepeat(!!checked)}
                  />
                  <Label htmlFor="indefinite">Repeat indefinitely</Label>
                </div>

                {!indefiniteRepeat && (
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !repeatEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {repeatEndDate ? format(repeatEndDate, "PPP") : "Pick end date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={repeatEndDate}
                          onSelect={setRepeatEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter location"
                  className="pl-10"
                />
              </div>
              {location && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={openLocationInMaps}
                  className="px-3"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Optional)</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="quantity"
                  type="number"
                  value={quantity || ""}
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Amount"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit (Optional)</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg, cups, etc."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
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
