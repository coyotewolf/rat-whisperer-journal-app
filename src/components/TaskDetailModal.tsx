
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, MapPin, Edit, Pencil } from "lucide-react"; // Added Pencil
import { format } from "date-fns";

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
}

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
}

const TaskDetailModal = ({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) => {
  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-700 border-green-300';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-300';
    }
  };

  const getTitleColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700';
      case 'medium': return 'text-yellow-700';
      case 'low': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  const openInMaps = () => {
    if (task.location) {
      const encodedLocation = encodeURIComponent(task.location);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-md bg-background/80 border-0 shadow-2xl">
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
            <DialogTitle className={`flex-1 text-center text-xl font-bold ${getTitleColor(task.priority)} flex items-center gap-2`}>
              {task.title}
              <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                {task.priority}
              </Badge>
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              className="bg-white/50 hover:bg-white/70 border-white/30"
            >
              <Pencil className="h-4 w-4 mr-1" /> {/* Changed to Pencil */}
              Edit
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {task.description && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-gray-600">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{format(task.dueDate, "MMM d, yyyy")}</span>
            </div>
            {task.dueTime && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{task.dueTime}</span>
              </div>
            )}
          </div>

          {task.location && (
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Location</h4>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 flex-1">{task.location}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInMaps}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  Open in Maps
                </Button>
              </div>
            </div>
          )}

          {(task.quantity || task.unit) && (
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Quantity</h4>
              <p className="text-gray-600">
                {task.quantity || ''} {task.unit || ''}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <Badge variant={task.completed ? "default" : "outline"}>
              {task.completed ? "Completed" : "Pending"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
