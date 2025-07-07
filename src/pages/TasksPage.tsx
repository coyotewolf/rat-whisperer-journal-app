import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Clock, CheckCircle, Circle, MapPin, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { format, isBefore, isToday, isTomorrow } from "date-fns";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useTranslation } from 'react-i18next';

const TasksPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> | Task) => {
    try {
      if ('id' in taskData) {
        await updateTask(taskData.id, taskData);
      } else {
        await createTask(taskData);
      }
      setEditingTask(null);
    } catch (error) {
      console.error(t('Error saving task:'), error);
    }
  };

  const handleDeleteTask = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        setTaskToDelete(null);
        setDeleteConfirmOpen(false);
      } catch (error) {
        console.error(t('Error deleting task:'), error);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/50 font-bold';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30';
      case 'low': return 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/30';
      default: return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

  const getTitleColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 dark:text-red-300 font-bold';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-card-foreground';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t("Today");
    if (isTomorrow(date)) return t("Tomorrow");
    if (isBefore(date, new Date())) return t("Overdue");
    return format(date, "MMM d");
  };

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDetailModalOpen(true);
  };

  const handleEditFromDetail = (task: Task) => {
    setEditingTask(task);
    setTaskDetailModalOpen(false);
    setTaskModalOpen(true);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  if (loading) {
    return <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-foreground">{t("Loading tasks...")}</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative">
      {/* Header */}
      <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-card-foreground hover:bg-accent/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2 rounded-xl bg-primary shadow-lg">
              <Calendar className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {t("Task Management")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("Organize your rat care tasks")}</p>
            </div>
          </div>
          <Button
            onClick={() => setTaskModalOpen(true)}
            variant="default"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("New Task")}
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="relative p-4">
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <Card
              key={task.id}
              className={`bg-card text-card-foreground border-border shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer ${task.completed ? 'opacity-60' : ''}`}
              onClick={() => handleTaskCardClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(task.id);
                    }}
                    className="mt-1 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

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
                            setEditingTask(task);
                            setTaskModalOpen(true);
                          }}
                          className="text-muted-foreground hover:text-accent-foreground h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaskToDelete(task.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getDateLabel(new Date(task.due_date))}</span>
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
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                <Calendar className="h-12 w-12 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("No tasks yet")}</h3>
              <p className="text-muted-foreground mb-4">{t("Create your first task to get organized!")}</p>
              <Button
                onClick={() => setTaskModalOpen(true)}
                variant="default"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("Create Your First Task")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
      />

      <TaskDetailModal
        isOpen={taskDetailModalOpen}
        onClose={() => setTaskDetailModalOpen(false)}
        task={selectedTask}
        onEdit={handleEditFromDetail}
      />

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTask}
        title={t("Delete Task")}
        description={t("Are you sure you want to delete this task? This action cannot be undone.")}
        confirmText={t("Delete")}
        variant="destructive"
      />
    </div>
  );
};

export default TasksPage;
