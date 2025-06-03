
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import AlertCards from "@/components/AlertCards";
import QuickLogModal from "@/components/QuickLogModal";
import AuthModal from "@/components/AuthModal";
import ActivityDetailModal from "@/components/ActivityDetailModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import LogEntryModal from "@/components/LogEntryModal";
import { 
  Heart, 
  Scale, 
  Thermometer, 
  Calendar, 
  Plus, 
  Activity,
  CheckSquare,
  Users,
  Bell,
  BookOpen,
  Edit
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppSettings } from "@/contexts/AppSettingsContext";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signOut } = useAppSettings();
  const [quickLogOpen, setQuickLogOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activityDetailOpen, setActivityDetailOpen] = useState(false);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [logEntryModalOpen, setLogEntryModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingLogEntry, setEditingLogEntry] = useState(null);

  // Mock data for recent activities and upcoming tasks
  const recentActivities = [
    { 
      id: 1, 
      type: "Grooming", 
      rat: "Pepper", 
      time: "2 mins ago", 
      status: "good",
      logEntry: { id: 1, type: "behavior", content: { tags: ["grooming"] }, rat_id: "1" }
    },
    { 
      id: 2, 
      type: "Weight Check", 
      rat: "Salt", 
      time: "1 hour ago", 
      status: "completed",
      logEntry: { id: 2, type: "weight", content: { weight: 250 }, rat_id: "2" }
    },
    { 
      id: 3, 
      type: "Medication", 
      rat: "Pepper", 
      time: "3 hours ago", 
      status: "stable",
      logEntry: { id: 3, type: "medication", content: { medication: "Antibiotics" }, rat_id: "1" }
    },
  ];

  const upcomingTasks = [
    {
      id: "1",
      title: "Clean cage",
      description: "Weekly deep clean of main cage",
      dueDate: new Date("2024-06-02"),
      dueTime: "10:00",
      priority: "high" as const,
      completed: false,
      location: "Living room"
    },
    {
      id: "2",
      title: "Vet appointment",
      description: "Routine checkup for Pepper",
      dueDate: new Date("2024-06-03"),
      dueTime: "14:30",
      priority: "medium" as const,
      completed: false,
      location: "Pet Clinic Downtown"
    },
    {
      id: "3",
      title: "Buy food",
      description: "Stock up on rat pellets and treats",
      dueDate: new Date("2024-06-04"),
      dueTime: "",
      priority: "low" as const,
      completed: false,
      quantity: "2",
      unit: "bags"
    },
  ];

  const handleSignOut = () => {
    signOut();
  };

  const handleActivityClick = (activity: any) => {
    setSelectedActivity(activity);
    setActivityDetailOpen(true);
  };

  const handleActivityEdit = (logEntry: any) => {
    setEditingLogEntry(logEntry);
    setLogEntryModalOpen(true);
    setActivityDetailOpen(false);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
  };

  const handleRecentActivitiesClick = () => {
    navigate("/logs");
  };

  const handleUpcomingTasksClick = () => {
    navigate("/tasks");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-300';
      case 'medium':
        return 'text-yellow-300';
      case 'low':
        return 'text-green-300';
      default:
        return 'text-white';
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
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">
              RatTracker
            </h1>
            <p className="text-sm text-purple-100/80">Your companion care dashboard</p>
          </div>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSignOut}
                  className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Sign Out
                </Button>
                <Button 
                  onClick={() => setQuickLogOpen(true)}
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Log
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative p-4 space-y-6">
        {user && <AlertCards />}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="backdrop-blur-md bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/rats')}>
            <CardContent className="p-4 text-center">
              <Heart className="h-8 w-8 mx-auto mb-2 text-pink-200" />
              <div className="text-2xl font-bold text-white">2</div>
              <div className="text-sm text-pink-100">Active Rats</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/logs')}>
            <CardContent className="p-4 text-center">
              <Scale className="h-8 w-8 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-bold text-white">12</div>
              <div className="text-sm text-blue-100">Total Logs</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/tasks')}>
            <CardContent className="p-4 text-center">
              <CheckSquare className="h-8 w-8 mx-auto mb-2 text-green-200" />
              <div className="text-2xl font-bold text-white">3</div>
              <div className="text-sm text-green-100">Pending Tasks</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border-purple-300/30 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/community')}>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-200" />
              <div className="text-2xl font-bold text-white">45</div>
              <div className="text-sm text-purple-100">Community</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
          <CardHeader 
            className="cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
            onClick={handleRecentActivitiesClick}
          >
            <CardTitle className="flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                onClick={() => handleActivityClick(activity)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <div className="text-white font-medium">{activity.type}</div>
                    <div className="text-sm text-gray-300">{activity.rat} • {activity.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-500/20 text-green-100 px-2 py-1 rounded">
                    {activity.status}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivityEdit(activity.logEntry);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 hover:bg-white/20"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl">
          <CardHeader 
            className="cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
            onClick={handleUpcomingTasksClick}
          >
            <CardTitle className="flex items-center gap-2 text-white">
              <Calendar className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{task.title}</span>
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      {task.dueDate.toLocaleDateString()} {task.dueTime && `• ${task.dueTime}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/library')}>
            <CardContent className="p-6 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-3 text-cyan-200" />
              <div className="text-lg font-semibold text-white mb-1">Library</div>
              <div className="text-sm text-gray-300">Care guides & tips</div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer" onClick={() => navigate('/community')}>
            <CardContent className="p-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-3 text-purple-200" />
              <div className="text-lg font-semibold text-white mb-1">Community</div>
              <div className="text-sm text-gray-300">Connect with others</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <QuickLogModal 
        isOpen={quickLogOpen} 
        onClose={() => setQuickLogOpen(false)} 
      />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />

      <ActivityDetailModal
        isOpen={activityDetailOpen}
        onClose={() => setActivityDetailOpen(false)}
        onEdit={handleActivityEdit}
        activity={selectedActivity}
      />

      <TaskDetailModal
        isOpen={taskDetailOpen}
        onClose={() => setTaskDetailOpen(false)}
        onEdit={() => {
          setTaskDetailOpen(false);
          navigate('/tasks');
        }}
        task={selectedTask}
      />

      <LogEntryModal
        isOpen={logEntryModalOpen}
        onClose={() => {
          setLogEntryModalOpen(false);
          setEditingLogEntry(null);
        }}
        logType={editingLogEntry?.type || 'behavior'}
        onLogAdded={() => {
          setLogEntryModalOpen(false);
          setEditingLogEntry(null);
        }}
        editingLog={editingLogEntry}
      />

      <BottomNav />
    </div>
  );
};

export default Index;
