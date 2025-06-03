
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { format, addDays } from "date-fns";

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  dueTime: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  repeatDays?: string[];
  repeatUntil?: Date | null;
  location?: string;
  quantity?: string;
  unit?: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: (task: Task) => void;
  task?: Task | null;
}

const TaskModal = ({ isOpen, onClose, onTaskAdded, task }: TaskModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly' | 'custom'>('none');
  const [repeatDays, setRepeatDays] = useState<string[]>([]);
  const [repeatUntil, setRepeatUntil] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate(format(new Date(), 'yyyy-MM-dd'));
    setDueTime("");
    setPriority('medium');
    setRepeatType('none');
    setRepeatDays([]);
    setRepeatUntil("");
    setLocation("");
    setQuantity("");
    setUnit("");
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDueDate(format(task.dueDate, 'yyyy-MM-dd'));
      setDueTime(task.dueTime);
      setPriority(task.priority);
      setRepeatType(task.repeatType || 'none');
      setRepeatDays(task.repeatDays || []);
      setRepeatUntil(task.repeatUntil ? format(task.repeatUntil, 'yyyy-MM-dd') : "");
      setLocation(task.location || "");
      setQuantity(task.quantity || "");
      setUnit(task.unit || "");
    } else {
      resetForm();
    }
  }, [task, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Task = {
      id: task?.id || Date.now().toString(),
      title,
      description,
      dueDate: new Date(dueDate),
      dueTime,
      priority,
      completed: task?.completed || false,
      repeatType,
      repeatDays: repeatType === 'custom' ? repeatDays : undefined,
      repeatUntil: repeatUntil ? new Date(repeatUntil) : null,
      location: location || undefined,
      quantity: quantity || undefined,
      unit: unit || undefined,
    };

    onTaskAdded(newTask);
    
    if (!task) {
      resetForm();
    } else {
      onClose();
    }
  };

  const handleRepeatDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setRepeatDays([...repeatDays, day]);
    } else {
      setRepeatDays(repeatDays.filter(d => d !== day));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
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
            <DialogTitle className="flex-1 text-white">
              {task ? "Edit Task" : "New Task"}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-white">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime" className="text-white">Time</Label>
              <Input
                id="dueTime"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Priority</Label>
            <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional location"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Quantity</Label>
              <Input
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Amount"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Unit</Label>
              <Input
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g., grams, ml"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Repeat</Label>
            <Select value={repeatType} onValueChange={(value: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom') => setRepeatType(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No repeat</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {repeatType === 'custom' && (
            <div className="space-y-2">
              <Label className="text-white">Repeat Days</Label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={repeatDays.includes(day)}
                      onCheckedChange={(checked) => handleRepeatDayChange(day, checked as boolean)}
                    />
                    <Label htmlFor={day} className="text-sm text-white">{day.slice(0, 3)}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {repeatType !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="repeatUntil" className="text-white">Repeat Until</Label>
              <Input
                id="repeatUntil"
                type="date"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
            {task ? "Update Task" : "Add Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
