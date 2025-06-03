
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Clock, CheckCircle, Circle, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskModal from "@/components/TaskModal";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/hooks/use-toast";
import { format, isBefore, isToday, isTomorrow } from "date-fns";

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

const TasksPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('ratTracker_tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate)
      }));
      setTasks(parsedTasks);
    }
  }, []);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('ratTracker_tasks', JSON.stringify(updatedTasks));
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
    if ('id' in taskData) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === taskData.id ? taskData : task
      );
      saveTasks(updatedTasks);
      toast({ title: "Success", description: "Task updated successfully!" });
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString()
      };
      saveTasks([...tasks, newTask]);
      toast({ title: "Success", description: "Task created successfully!" });
    }
    setEditingTask(null);
  };

  const handleDeleteTask = () => {
    if (taskToDelete) {
      const updatedTasks = tasks.filter(task => task.id !== taskToDelete);
      saveTasks(updatedTasks);
      toast({ title: "Success", description: "Task deleted successfully!" });
      setTaskToDelete(null);
      setDeleteConfirmOpen(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-100 border-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-100 border-green-300';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-300';
    }
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isBefore(date, new Date())) return "Overdue";
    return format(date, "MMM d");
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 pb-20 relative overflow-hidden">
      {/* Animated Background */}
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
                Task Management
              </h1>
              <p className="text-sm text-purple-100/80">Organize your rat care tasks</p>
            </div>
          </div>
          <Button 
            onClick={() => setTaskModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="relative p-4">
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <Card key={task.id} className={`backdrop-blur-md bg-white/10 border-white/20 shadow-xl transition-all duration-300 rounded-xl ${task.completed ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
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
                      <h3 className={`font-semibold text-white ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getPriorityColor(task.priority)} border backdrop-blur-sm`}>
                          {task.priority}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingTask(task);
                            setTaskModalOpen(true);
                          }}
                          className="text-white hover:bg-white/20 h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTaskToDelete(task.id);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-white hover:bg-white/20 hover:text-red-300 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {task.description && (
                      <p className="text-sm text-purple-100/80">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-blue-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{getDateLabel(task.dueDate)}</span>
                      </div>
                      {task.dueTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.dueTime}</span>
                        </div>
                      )}
                      {task.repeat && task.repeat.type !== 'none' && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-100 border-blue-300">
                            Repeats {task.repeat.type}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {(task.location || task.quantity) && (
                      <div className="flex items-center gap-4 text-sm text-green-100">
                        {task.location && (
                          <div className="flex items-center gap-1">
                            <span>📍 {task.location}</span>
                          </div>
                        )}
                        {task.quantity && (
                          <div className="flex items-center gap-1">
                            <span>📦 {task.quantity}{task.unit ? ` ${task.unit}` : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
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
              <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
              <p className="text-purple-100 mb-4">Create your first task to get organized!</p>
              <Button 
                onClick={() => setTaskModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
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

      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export default TasksPage;
