import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Clock, CheckCircle, Circle, MapPin, Pencil } from "lucide-react";
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
      case 'high': return 'bg-red-500/20 text-red-100 border-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-100 border-green-300';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-300';
    }
  };

  const getTitleColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-200';
      case 'medium': return 'text-yellow-200';
      case 'low': return 'text-green-200';
      default: return 'text-white';
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-white text-lg">{t("Loading tasks...")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      {/* Header */}
      <div className="relative backdrop-blur-md bg-white/10 border-b border-white/20 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
                {t("Task Management")}
              </h1>
              <p className="text-sm text-purple-100/80">{t("Organize your rat care tasks")}</p>
            </div>
          </div>
          <Button
            onClick={() => setTaskModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
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
              className={`backdrop-blur-md bg-white/10 border-white/20 shadow-xl transition-all duration-300 cursor-pointer hover:shadow-2xl ${task.completed ? 'opacity-60' : ''}`}
              onClick={() => handleTaskCardClick(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(task.id);
                    }}
                    className="mt-1 text-white hover:text-green-300 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-300" />
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
                        <Badge className={`${getPriorityColor(task.priority)} border backdrop-blur-sm text-xs`}>
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
                          className="text-white hover:bg-white/20 h-8 w-8 p-0"
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
                          className="text-white hover:bg-white/20 hover:text-red-300 h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-purple-100/80">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-blue-100">
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
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                <Calendar className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("No tasks yet")}</h3>
              <p className="text-purple-100 mb-4">{t("Create your first task to get organized!")}</p>
              <Button
                onClick={() => setTaskModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
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
