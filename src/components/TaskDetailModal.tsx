
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Calendar, Clock, MapPin, Pencil } from "lucide-react";
import { format } from "date-fns";
import type { Task } from "@/hooks/useTasks";

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit: (task: Task) => void;
}

const TaskDetailModal = ({ isOpen, onClose, task, onEdit }: TaskDetailModalProps) => {
  const { t } = useTranslation();
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
      <DialogContent className="sm:max-w-md bg-card text-card-foreground border border-border shadow-lg">
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
            <DialogTitle className={`flex-1 text-center text-xl font-bold ${getTitleColor(task.priority)} flex items-center gap-2`}>
              {task.title}
              <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
                {task.priority}
              </Badge>
            </DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(task)}
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Pencil className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("Edit")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>
        
        <div className="space-y-4 text-foreground">
          {task.description && (
            <div>
              <h4 className="font-medium text-foreground mb-1">{t("Description")}</h4>
              <p className="text-muted-foreground">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-muted-foreground">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(task.due_date), "MMM d, yyyy")}</span>
            </div>
            {task.due_time && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>{task.due_time}</span>
              </div>
            )}
          </div>

          {task.location && (
            <div>
              <h4 className="font-medium text-foreground mb-2">{t("Location")}</h4>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground flex-1">{task.location}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInMaps}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 border-border"
                >
                  {t("Open in Maps")}
                </Button>
              </div>
            </div>
          )}

          {(task.quantity || task.unit) && (
            <div>
              <h4 className="font-medium text-foreground mb-1">{t("Quantity")}</h4>
              <p className="text-muted-foreground">
                {task.quantity || ''} {task.unit || ''}
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{t("Status")}:</span>
            <Badge variant={task.completed ? "default" : "outline"}>
              {task.completed ? t("Completed") : t("Pending")}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
