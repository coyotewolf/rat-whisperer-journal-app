import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Activity, Heart, Calendar, MapPin, Sparkles, Settings, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import QuickLogModal from "@/components/QuickLogModal";
import SettingsModal from "@/components/SettingsModal";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import AlertCards from "@/components/AlertCards";
import EditLogModal from "@/components/EditLogModal";
import LogDetailModal from "@/components/LogDetailModal";
import { format, isToday, isTomorrow, isBefore } from "date-fns";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useLogEntries } from "@/hooks/useLogEntries";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tasks, loading, createTask, updateTask } = useTasks();
  const { logs, addLog, updateLog, deleteLog } = useLogEntries();
  const { user } = useAuth();
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<any | null>(null);
  const [selectedLogEntry, setSelectedLogEntry] = useState<any | null>(null);
  const [isLogDetailOpen, setIsLogDetailOpen] = useState(false);

  // Get the three most recent activities, sorted by timestamp (most recent first)
  const recentActivities = logs
    .slice(0, 3)
    .map((log) => {
      const timeDiff = Date.now() - new Date(log.timestamp).getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      let timeAgo;
      if (days > 0) {
        timeAgo = t("{{count}} day(s) ago", { count: days });
      } else if (hours > 0) {
        timeAgo = t("{{count}} hour(s) ago", { count: hours });
      } else {
        timeAgo = t('Just now');
      }

      return {
        id: log.id,
        type: log.behavior || log.type,
        rat: log.ratNames ? log.ratNames.join(', ') : t('Unknown'),
        time: timeAgo,
        // Use the actual status from the log object if available, otherwise fallback or specific logic
        status: log.status || (log.type === 'environment' ? 'completed' : 'completed'), // Use log.status
        notes: log.notes,
        ratNames: log.ratNames || [],
        hashtags: log.hashtags || [],
        weight: log.weight,
        originalLog: log
      };
    });

  // Function to handle new log entries from QuickLogModal
  const handleNewLogEntry = async (logEntryDataFromModal: any) => { // Renamed for clarity
    try {
      // Directly pass the object received from LogEntryModal.
      // useLogEntries.addLog expects an object conforming to Omit<LogEntry, 'id' | 'timestamp' | 'rat_id'>
      // We've structured logEntryDataFromModal in LogEntryModal to match this.
      await addLog(logEntryDataFromModal);
      // Successful toast and console logs are handled within useLogEntries.addLog
      // console.log(t("New log entry processing initiated via hook")); // Optional: if you want a log here
    } catch (error) {
      // Error handling (toast) is also primarily within useLogEntries.addLog
      // This catch block might only catch errors if addLog itself is not found or if there's an issue
      // in the way it's called before it even executes its own try/catch.
      console.error(t("Error calling addLog from Index.tsx:"), error);
    }
  };

  // Get upcoming tasks (not completed, sorted by due date)
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3);

  const handleTaskSave = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'> | Task) => {
    try {
      if ('id' in taskData) {
        await updateTask(taskData.id, taskData);
      } else {
        await createTask(taskData);
      }
      setIsNewTaskOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error(t('Error saving task:'), error);
    }
  };

  const handleTaskCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleEditFromDetail = (task: Task) => {
    setIsTaskDetailOpen(false);
    setEditingTask(task);
    setIsNewTaskOpen(true);
  };

  const handleEditActivity = (activityToEdit: any) => {
    setEditingActivity(activityToEdit.originalLog || activityToEdit);
    setIsEditModalOpen(true);
  };

  const handleUpdateActivity = async (updatedActivity: any) => {
    try {
      await updateLog(updatedActivity.id, updatedActivity);
      setIsEditModalOpen(false);
      setEditingActivity(null);
      console.log(t("Activity updated in Supabase:"), updatedActivity);
    } catch (error) {
      console.error(t("Failed to update activity:"), error);
    }
  };

  const handleDeleteActivity = async (deletedActivityId: string) => {
    try {
      await deleteLog(deletedActivityId);
      setIsEditModalOpen(false);
      setEditingActivity(null);
      console.log(t("Activity deleted from Supabase:"), deletedActivityId);
    } catch (error) {
      console.error(t("Failed to delete activity:"), error);
    }
  };

  const handleLogCardClick = (activity: any) => {
    setSelectedLogEntry(activity.originalLog || activity);
    setIsLogDetailOpen(true);
  };

  const handleEditFromLogDetail = (log: any) => {
    setIsLogDetailOpen(false);
    handleEditActivity({ originalLog: log });
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return t("Today");
    if (isTomorrow(date)) return t("Tomorrow");
    if (isBefore(date, new Date())) return t("Overdue");
    return format(date, "MMM d");
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      // Using destructive for high, a common pattern.
      // Foreground for destructive is usually light, so text-destructive-foreground.
      // Background can be a lighter shade of destructive or just destructive.
      case 'high': return 'bg-destructive/20 text-destructive-foreground border-destructive'; // Adjusted for theming
      // Using a secondary or accent color for medium.
      case 'medium': return 'bg-secondary/20 text-secondary-foreground border-secondary'; // Adjusted for theming
      // Using a success-like color for low, or a more neutral accent.
      // For now, let's use accent.
      case 'low': return 'bg-accent/20 text-accent-foreground border-accent'; // Adjusted for theming
      default: return 'bg-muted/20 text-muted-foreground border-border'; // Default to muted
    }
  };

  // Title color can often be the primary text color of the card or a slightly emphasized one.
  // Or, it can be tied to priority. For simplicity, let's use card-foreground or primary.
  // This function might not be strictly needed if titles just use default card text color.
  // For now, let's make priority titles use a more prominent color from the theme.
const getTitlePriorityClasses = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-destructive'; // Destructive color for high priority titles
      case 'medium': return 'text-primary';    // Primary color for medium
      case 'low': return 'text-accent-foreground'; // Accent for low
      default: return 'text-card-foreground'; // Default card text color
    }
  };

  const getActivityStatusClasses = (status: string) => {
    switch (status?.toLowerCase()) { // Use toLowerCase for case-insensitivity
      // Health statuses
      case 'excellent':
        return 'bg-green-500 text-white border-green-600'; // Or use theme colors like 'bg-success text-success-foreground'
      case 'good':
        return 'bg-lime-500 text-white border-lime-600'; // Or 'bg-accent text-accent-foreground'
      case 'fair':
        return 'bg-yellow-500 text-black border-yellow-600'; // Or 'bg-warning text-warning-foreground'
      case 'poor':
        return 'bg-orange-500 text-white border-orange-600'; // Or 'bg-destructive/80 text-destructive-foreground'
      case 'sick':
        return 'bg-red-600 text-white border-red-700'; // Or 'bg-destructive text-destructive-foreground'
      
      // Other statuses (e.g., from environment logs)
      case 'completed':
        return 'bg-primary text-primary-foreground border-primary';
      default: // Fallback for unknown or other statuses
        return 'bg-secondary text-secondary-foreground border-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
      {/* Animated Background - Consider removing or theming if kept */}
      {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div> */}
      {/* SVG background - color needs to be themed if kept */}
      {/* <div className="absolute top-0 left-0 w-full h-full opacity-40" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div> */

      {/* Header */}
      <div className="relative bg-card text-card-foreground border-b border-border p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary shadow-lg">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {t("RatTracker")}
              </h1>
              <p className="text-sm text-muted-foreground">{t("Your pet care companion")}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            // className="backdrop-blur-sm bg-white/10 border-white/20 text-white hover:bg-white/20" // Replaced by standard outline button
          >
            <Settings className="h-4 w-4" /> {/* Icon color will inherit from button's text color */}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Button
            onClick={() => setIsQuickLogOpen(true)}
            className="h-20 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <Plus className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">{t("Quick Log")}</div>
            </div>
          </Button>
          
          <Button
            onClick={() => setIsNewTaskOpen(true)}
            className="h-20 bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="text-center">
              <Calendar className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">{t("New Task")}</div>
            </div>
          </Button>
          
          <Button className="h-20 bg-accent text-accent-foreground hover:bg-accent/80 shadow-xl transform hover:scale-105 transition-all duration-300"> {/* Assuming accent color for Reports */}
            <div className="text-center">
              <Activity className="h-6 w-6 mx-auto mb-1" />
              <div className="text-xs font-medium">{t("Reports")}</div>
            </div>
          </Button>
        </div>

        {/* Alert Cards */}
        <div className="mb-6">
          <AlertCards />
        </div>

        {/* Upcoming Tasks */}
        <Card className="bg-card text-card-foreground border-border shadow-xl mb-6"> {/* Themed Card */}
          <CardHeader
            className="cursor-pointer hover:bg-accent/50 transition-colors" // Use themed hover
            onClick={() => navigate('/tasks')}
          >
            <CardTitle className="text-card-foreground flex items-center gap-2"> {/* Themed Title */}
              <Calendar className="h-5 w-5 text-primary" /> {/* Themed Icon */}
              {t("Upcoming Tasks")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">{t("Loading tasks...")}</p> {/* Themed text */}
              </div>
            ) : upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border cursor-pointer hover:bg-accent/50 transition-colors" // Themed item
                  onClick={() => handleTaskCardClick(task)}
                >
                  <div className="flex-1">
                    <p className={`font-medium ${getTitlePriorityClasses(task.priority)}`}>{task.title}</p> {/* Themed title based on priority */}
                    <p className="text-sm text-muted-foreground">{t("Due")}: {getDateLabel(new Date(task.due_date))}</p> {/* Themed text */}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPriorityClasses(task.priority)} border`}> {/* Themed Badge */}
                      {t(task.priority)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFromDetail(task);
                      }}
                      className="text-muted-foreground hover:text-primary h-7 w-7" // Themed icon button
                      aria-label={t("Edit task {{taskTitle}}", { taskTitle: task.title })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">{t("No upcoming tasks")}</p> {/* Themed text */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsNewTaskOpen(true)}
                  className="mt-2" // Standard outline button will be themed
                >
                  {t("Create Task")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="bg-card text-card-foreground border-border shadow-xl"> {/* Themed Card */}
          <CardHeader
            className="cursor-pointer hover:bg-accent/50 transition-colors" // Themed hover
            onClick={() => navigate('/logs')}
          >
            <CardTitle className="text-card-foreground flex items-center gap-2"> {/* Themed Title */}
              <Heart className="h-5 w-5 text-destructive" /> {/* Themed Icon (using destructive for heart as an example) */}
              {t("Recent Activities")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border group cursor-pointer hover:bg-accent/50 transition-colors" // Made clickable
                  onClick={() => handleLogCardClick(activity)}
                >
                  <div className="flex-1">
                    <p className="text-card-foreground font-medium">{t(activity.type)}</p> {/* Themed text */}
                    <p className="text-sm text-muted-foreground">{activity.rat} • {activity.time}</p> {/* Themed text */}
                    {activity.weight && (
                      <p className="text-xs text-muted-foreground/80">{t("Weight")}: {activity.weight}g</p> /* Themed text */
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getActivityStatusClasses(activity.status)} border-0`}
                    >
                      {t(activity.status)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary h-7 w-7 group-hover:text-primary transition-colors" // Themed icon button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditActivity(activity);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">{t("No recent activities")}</p> {/* Themed text */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsQuickLogOpen(true)}
                  className="mt-2" // Standard outline button will be themed
                >
                  {t("Add Activity")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onLogCreated={handleNewLogEntry}
      />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <TaskModal
        isOpen={isNewTaskOpen}
        onClose={() => {
          setIsNewTaskOpen(false);
          setEditingTask(null);
        }}
        onSave={handleTaskSave}
        task={editingTask}
      />
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={() => setIsTaskDetailOpen(false)}
        task={selectedTask}
        onEdit={handleEditFromDetail}
      />
      <LogDetailModal
        isOpen={isLogDetailOpen}
        onClose={() => setIsLogDetailOpen(false)}
        logEntry={selectedLogEntry}
        onEdit={handleEditFromLogDetail}
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
          onLogDeleted={handleDeleteActivity}
        />
      )}
    </div>
  );
};

export default Index;

</edits_to_apply>
