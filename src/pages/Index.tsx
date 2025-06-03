
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity, Heart, Calendar, MapPin, Sparkles, Settings, Edit, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import QuickLogModal from "@/components/QuickLogModal";
import SettingsModal from "@/components/SettingsModal";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import AlertCards from "@/components/AlertCards";
import EditLogModal from "@/components/EditLogModal"; // Import EditLogModal
import { format, isToday, isTomorrow, isBefore } from "date-fns";

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

const Index = () => {
  const navigate = useNavigate();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // New state for editing task
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);


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

  const [recentActivities, setRecentActivities] = useState([ // Make recentActivities stateful
    { id: 1, type: "Health Check", rat: "Pepper", time: "2 hours ago", status: "good", notes: "Routine check, all clear.", rats: ["Pepper"], hashtags: ["health", "routine"] },
    { id: 2, type: "Feeding", rat: "Salt", time: "4 hours ago", status: "completed", notes: "Ate all the food.", rats: ["Salt"], hashtags: ["feeding", "routine"] },
    { id: 3, type: "Weight", rat: "Cinnamon", time: "1 day ago", status: "stable", weight: 230, rats: ["Cinnamon"], hashtags: ["weight", "health"] },
  ]);

  // Get upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .slice(0, 3);

  const handleTaskSave = (taskData: Task) => { // Changed taskData type to Task
    if (taskData.id) { // If taskData has an ID, it's an existing task being edited
      saveTasks(tasks.map(task => task.id === taskData.id ? taskData : task));
    } else { // Otherwise, it's a new task
      const newTask: Task = {
        ...taskData,
        id: crypto.randomUUID() // Use crypto.randomUUID for new tasks
      };
      saveTasks([...tasks, newTask]);
    }
    setIsNewTaskOpen(false); // Close the task modal after saving
    setEditingTask(null); // Clear editing task state
  };

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleEditFromDetail = (task: Task) => {
    setIsTaskDetailOpen(false); // Close the detail modal
    setEditingTask(task); // Set the task to be edited
    setIsNewTaskOpen(true); // Open the TaskModal in edit mode
  };

  // const handleActivityClick = (activity: any) => { // Commenting out as card click will be removed for consistency
  //   // Navigate to logs page or open edit modal
  //   navigate('/logs');
  // };

  const handleEditActivity = (activityToEdit: any) => {
    setEditingActivity(activityToEdit);
    setIsEditModalOpen(true);
  };

  const handleUpdateActivity = (updatedActivity: any) => {
    setRecentActivities(prevActivities =>
      prevActivities.map(act => act.id === updatedActivity.id ? updatedActivity : act)
    );
    setIsEditModalOpen(false);
    setEditingActivity(null);
    console.log("Activity updated (simulated):", updatedActivity);
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

  const getTitleColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-200';
      case 'medium': return 'text-yellow-200';
      case 'low': return 'text-green-200';
      default: return 'text-white';
    }
  };

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
            <div className="p-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-500 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                RatTracker
              </h1>
              <p className="text-sm text-orange-100/80">Your pet care companion</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button 
            onClick={() => setIsQuickLogOpen(true)}
            className="h-20 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <Plus className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">Quick Log</div>
            </div>
          </Button>
          
          <Button 
            onClick={() => setIsNewTaskOpen(true)}
            className="h-20 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">New Task</div>
            </div>
          </Button>
          
          <Button className="h-20 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">Reports</div>
            </div>
          </Button>
        </div>

        {/* Alert Cards */}
        <div className="mb-6">
          <AlertCards />
        </div>

        {/* Upcoming Tasks */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl mb-6">
          <CardHeader 
            className="cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => navigate('/tasks')}
          >
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-cyan-300" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => handleTaskCardClick(task)}
                >
                  <div className="flex-1"> {/* Wrap content in a flex-1 div to push button to the right */}
                    <p className={`font-medium ${getTitleColor(task.priority)}`}>{task.title}</p> {/* Apply priority color */}
                    <p className="text-sm text-purple-100">Due: {getDateLabel(task.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2"> {/* Container for badge and edit button */}
                    <Badge className={`${getPriorityColor(task.priority)} border backdrop-blur-sm`}>
                      {task.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent parent card's onClick
                        handleEditFromDetail(task);
                      }}
                      className="text-white/60 hover:text-cyan-300 h-7 w-7" // Adjusted size and color for consistency
                      aria-label={`Edit task ${task.title}`}
                    >
                      <Pencil className="h-4 w-4" /> {/* Consistent icon size */}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-purple-100">No upcoming tasks</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsNewTaskOpen(true)}
                  className="mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Create Task
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
          <CardHeader 
            className="cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => navigate('/logs')}
          >
            <CardTitle className="text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-300" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg backdrop-blur-sm bg-white/5 border border-white/10 group" // Removed cursor-pointer and onClick
              >
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.type}</p>
                  <p className="text-sm text-purple-100">{activity.rat} • {activity.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    className={`${
                      activity.status === 'good' ? 'bg-green-500/20 text-green-100' : 
                      activity.status === 'completed' ? 'bg-blue-500/20 text-blue-100' : 
                      'bg-yellow-500/20 text-yellow-100'
                    } border-0 backdrop-blur-sm`}
                  >
                    {activity.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-cyan-300 h-7 w-7 group-hover:text-white transition-colors"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent any potential parent click events
                      handleEditActivity(activity);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
      <QuickLogModal isOpen={isQuickLogOpen} onClose={() => setIsQuickLogOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TaskModal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setEditingTask(null); // Clear editing task when modal closes
        }}
        onSave={handleTaskSave}
        task={editingTask} // Pass the task for editing
      />
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        task={selectedTask}
        onEdit={handleEditFromDetail}
      />
      {isEditModalOpen && editingActivity && (
        <EditLogModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingActivity(null);
          }}
          logToEdit={editingActivity}
          onLogUpdated={handleUpdateActivity}
        />
      )}
    </div>
  );
};

export default Index;
