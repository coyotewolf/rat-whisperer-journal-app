
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import { format, isBefore, isToday, isTomorrow } from "date-fns";

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

const TasksPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    // Load tasks from localStorage
    const storedTasks = localStorage.getItem('ratTracker_tasks');
    if (storedTasks) {
      const parsedTasks = JSON.parse(storedTasks).map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        repeatUntil: task.repeatUntil ? new Date(task.repeatUntil) : null
      }));
      setTasks(parsedTasks.filter((task: Task) => !task.completed));
    }
  }, []);

  const handleTaskSave = (taskData: any) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    localStorage.setItem('ratTracker_tasks', JSON.stringify(updatedTasks));
  };

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleTaskEdit = () => {
    setIsTaskDetailOpen(false);
    // Here you would populate the edit form with selected task data
    setIsNewTaskOpen(true);
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (isBefore(date, new Date())) return "Overdue";
    return format(date, "MMM d");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-100 border-red-300';
      case 'medium': return 'bg-yellow-500/20 text-yellow-100 border-yellow-300';
      case 'low': return 'bg-green-500/20 text-green-100 border-green-300';
      default: return 'bg-gray-500/20 text-gray-100 border-gray-300';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-300';
      case 'medium': return 'text-yellow-300';
      case 'low': return 'text-green-300';
      default: return 'text-white';
    }
  };

  const sortedTasks = tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                Task Management
              </h1>
              <p className="text-sm text-orange-100/80">Organize your rat care schedule</p>
            </div>
          </div>
          <Button 
            onClick={() => setIsNewTaskOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="relative p-4">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
              <Calendar className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks yet</h3>
            <p className="text-purple-100 mb-4">Create your first task to get organized!</p>
            <Button 
              onClick={() => setIsNewTaskOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <Card 
                key={task.id} 
                className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer rounded-xl"
                onClick={() => handleTaskCardClick(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${getPriorityTextColor(task.priority)} mb-1`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-purple-100 mb-2">{task.description}</p>
                      )}
                    </div>
                    <Badge className={`${getPriorityColor(task.priority)} border backdrop-blur-sm ml-3`}>
                      {task.priority}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-purple-100">
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
                    
                    {task.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-24">{task.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {(task.quantity || task.unit) && (
                    <div className="mt-2 text-xs text-gray-300">
                      Quantity: {task.quantity && task.unit ? `${task.quantity} ${task.unit}` : 
                                task.quantity ? task.quantity : 
                                task.unit ? task.unit : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <TaskModal 
        isOpen={isNewTaskOpen} 
        onClose={() => setIsNewTaskOpen(false)} 
        onSave={handleTaskSave}
      />
      
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        onEdit={handleTaskEdit}
        task={selectedTask}
      />
    </div>
  );
};

export default TasksPage;
