
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, MapPin, Calendar, Clock, Repeat } from "lucide-react";
import { format } from "date-fns";

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

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  task: Task | null;
}

const TaskDetailModal = ({ isOpen, onClose, onEdit, task }: TaskDetailModalProps) => {
  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-100 border-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-100 border-green-300';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-300';
    }
  };

  const formatRepeat = () => {
    if (!task.repeatType || task.repeatType === 'none') return 'No repeat';
    
    switch (task.repeatType) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'custom': 
        return task.repeatDays?.length ? `Custom (${task.repeatDays.join(', ')})` : 'Custom';
      default: return 'No repeat';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-xl bg-gradient-to-br from-indigo-900/90 via-purple-900/90 to-pink-800/90 backdrop-blur-md border-white/20">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-lg bg-gray-100 hover:bg-gray-200 p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex-1 text-center text-white">Task Details</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="rounded-lg bg-orange-100 hover:bg-orange-200 p-2"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium text-gray-300">Title</label>
            <p className="text-lg font-semibold text-white">{task.title}</p>
          </div>
          
          {task.description && (
            <div>
              <label className="text-sm font-medium text-gray-300">Description</label>
              <p className="text-white">{task.description}</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due Date
              </label>
              <p className="text-white">{format(task.dueDate, 'MMM d, yyyy')}</p>
            </div>
            
            {task.dueTime && (
              <div>
                <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time
                </label>
                <p className="text-white">{task.dueTime}</p>
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300">Priority</label>
            <Badge className={`${getPriorityColor(task.priority)} border backdrop-blur-sm`}>
              {task.priority}
            </Badge>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              Repeat
            </label>
            <p className="text-white">{formatRepeat()}</p>
            {task.repeatUntil && (
              <p className="text-sm text-gray-300">Until {format(task.repeatUntil, 'MMM d, yyyy')}</p>
            )}
          </div>
          
          {task.location && (
            <div>
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Location
              </label>
              <p className="text-white">{task.location}</p>
            </div>
          )}
          
          {(task.quantity || task.unit) && (
            <div>
              <label className="text-sm font-medium text-gray-300">Quantity</label>
              <p className="text-white">
                {task.quantity && task.unit ? `${task.quantity} ${task.unit}` : 
                 task.quantity ? task.quantity : 
                 task.unit ? task.unit : ''}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
