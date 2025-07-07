
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil, CheckCircle, Circle, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import type { Task } from "@/hooks/useTasks";
import { getDateLabel } from "@/utils/activityUtils";

interface UpcomingTasksProps {
  tasks: Task[];
  loading: boolean;
  onTaskCardClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNewTaskClick: () => void;
  onToggleTaskCompletion?: (taskId: string) => void;
}

const UpcomingTasks = ({ 
  tasks, 
  loading, 
  onTaskCardClick, 
  onEditTask, 
  onNewTaskClick,
  onToggleTaskCompletion
}: UpcomingTasksProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/40 text-destructive-foreground border-2 border-destructive font-bold';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/50';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getTitleColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive font-bold';
      case 'medium': return 'text-yellow-700 dark:text-yellow-300';
      case 'low': return 'text-green-700 dark:text-green-300';
      default: return 'text-card-foreground';
    }
  };

  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  return (
    <Card className="bg-card text-card-foreground border-border shadow-xl mb-6">
      <CardHeader
        className="cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => navigate('/tasks')}
      >
        <CardTitle className="text-card-foreground flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          {t("Upcoming Tasks")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{t("Loading tasks...")}</p>
          </div>
        ) : upcomingTasks.length > 0 ? (
          upcomingTasks.map((task) => (
            <Card
              key={task.id}
              className={`bg-card text-card-foreground border-border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${task.completed ? 'opacity-60' : ''}`}
              onClick={() => onTaskCardClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {onToggleTaskCompletion && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskCompletion(task.id);
                      }}
                      className="mt-1 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>
                  )}

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <h3 className={`font-semibold ${getTitleColor(task.priority)} ${task.completed ? 'line-through' : ''}`}>
                          {task.title}
                        </h3>
                        <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                          {t(task.priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTask(task);
                          }}
                          className="text-muted-foreground hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getDateLabel(new Date(task.due_date), t)}</span>
                      </div>
                      {task.due_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.due_time}</span>
                        </div>
                      )}
                      {task.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32">{task.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">{t("No upcoming tasks")}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onNewTaskClick}
              className="mt-2"
            >
              {t("Create Task")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingTasks;
