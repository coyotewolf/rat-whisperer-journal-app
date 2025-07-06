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
      case 'high': return 'bg-destructive/20 text-destructive-foreground border-destructive';
      case 'medium': return 'bg-yellow-600/20 text-yellow-foreground border-yellow-600';
      case 'low': return 'bg-green-600/20 text-green-foreground border-green-600';
      default: return 'bg-muted/20 text-muted-foreground border-muted';
    }
  };

  const getTitleColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-foreground';
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">{t("Loading tasks...")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <div className="relative backdrop-blur-md bg-card/80 border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("Task Management")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("Organize your rat care tasks")}</p>
            </div>
          </div>
          <Button
            onClick={() => setTaskModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
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
              className={`bg-card text-card-foreground border border-border shadow-md transition-all duration-300 cursor-pointer hover:shadow-lg ${task.completed ? 'opacity-60' : ''}`}
              onClick={() => handleTaskCardClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(task.id);
                    }}
                    className="mt-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-primary" />
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
                        <Badge className={`${getPriorityColor(task.priority)} border text-xs`}>
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
                          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
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
                          className="text-muted-foreground hover:bg-destructive/20 hover:text-destructive h-8 w-8 p-0"
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
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{t("No tasks yet")}</h3>
              <p className="text-muted-foreground mb-4">{t("Create your first task to get organized!")}</p>
              <Button
                onClick={() => setTaskModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
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
        onDelete={deleteTask} // Pass the deleteTask function
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
