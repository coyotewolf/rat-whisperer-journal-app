
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import type { Task } from "@/hooks/useTasks";
import { getPriorityClasses, getTitlePriorityClasses } from "@/utils/cardStyleUtils";
import { getDateLabel } from "@/utils/activityUtils";

interface UpcomingTasksProps {
  tasks: Task[];
  loading: boolean;
  onTaskCardClick: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNewTaskClick: () => void;
}

const UpcomingTasks = ({ 
  tasks, 
  loading, 
  onTaskCardClick, 
  onEditTask, 
  onNewTaskClick 
}: UpcomingTasksProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
            <div
              key={task.id}
              className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => onTaskCardClick(task)}
            >
              <div className="flex-1">
                <p className={`font-medium ${getTitlePriorityClasses(task.priority)}`}>{task.title}</p>
                <p className="text-sm text-muted-foreground">{t("Due")}: {getDateLabel(new Date(task.due_date), t)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getPriorityClasses(task.priority)} border`}>
                  {t(task.priority)}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditTask(task);
                  }}
                  className="text-muted-foreground hover:text-primary h-7 w-7"
                  aria-label={t("Edit task {{taskTitle}}", { taskTitle: task.title })}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
