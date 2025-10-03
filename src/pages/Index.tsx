import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import QuickLogModal from "@/components/QuickLogModal";
import SettingsModal from "@/components/SettingsModal";
import TaskModal from "@/components/TaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import AlertCards from "@/components/AlertCards";
import EditLogModal from "@/components/EditLogModal";
import LogDetailModal from "@/components/LogDetailModal";
import IndexHeader from "@/components/IndexHeader";
import QuickActions from "@/components/QuickActions";
import UpcomingTasks from "@/components/UpcomingTasks";
import RecentActivities from "@/components/RecentActivities";
import SmartReminders from "@/components/SmartReminders";
import QuickLogFAB from "@/components/QuickLogFAB";
import { useTasks, type Task } from "@/hooks/useTasks";
import { useLogEntries } from "@/hooks/useLogEntries";
import { useAuth } from "@/hooks/useAuth";
import { useIndexModals } from "@/hooks/useIndexModals";
import { useReminderSettings } from "@/hooks/useReminderSettings";
import { useTranslation } from 'react-i18next';
import { processRecentActivities } from "@/utils/activityUtils";
import { generateSmartReminders } from "@/utils/smartTaskReminders";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { t } = useTranslation();
  const { tasks, loading, createTask, updateTask, toggleTaskCompletion } = useTasks();
  const { logs, loading: logsLoading, initialLoadComplete, addLog, updateLog, deleteLog } = useLogEntries();
  const { user } = useAuth();
  const { settings: reminderSettings } = useReminderSettings();
  const queryClient = useQueryClient();
  const {
    isQuickLogOpen,
    setIsQuickLogOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isNewTaskOpen,
    setIsNewTaskOpen,
    isTaskDetailOpen,
    setIsTaskDetailOpen,
    selectedTask,
    setSelectedTask,
    editingTask,
    setEditingTask,
    isEditModalOpen,
    setIsEditModalOpen,
    editingActivity,
    setEditingActivity,
    selectedLogEntry,
    setSelectedLogEntry,
    isLogDetailOpen,
    setIsLogDetailOpen,
  } = useIndexModals();

  const recentActivities = processRecentActivities(logs, t);
  
  // Convert reminder settings to the format expected by generateSmartReminders
  const reminderConfig = reminderSettings ? {
    feeding: reminderSettings.find(s => s.type === 'feeding')?.frequency_days || 1,
    water: reminderSettings.find(s => s.type === 'water')?.frequency_days || 3,
    cage_cleaning: reminderSettings.find(s => s.type === 'cage_cleaning')?.frequency_days || 5,
  } : undefined;
  
  const smartReminders = generateSmartReminders(logs, tasks, t, reminderConfig);

  const handleNewLogEntry = async (logEntryDataFromModal: any) => {
    try {
      await addLog(logEntryDataFromModal);
    } catch (error) {
      console.error(t("Error calling addLog from Index.tsx:"), error);
    }
  };

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

  const [quickLogPreset, setQuickLogPreset] = useState<{ type: string; defaultValues?: Record<string, any> } | null>(null);
  const [settingsInitialSection, setSettingsInitialSection] = useState<'quickLogActions' | undefined>(undefined);

  const handleQuickLogAdded = () => {
    // Refresh data after quick log is added
    queryClient.invalidateQueries({ queryKey: ["log-entries"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  };

  const handleOpenQuickLogSettings = () => {
    setSettingsInitialSection('quickLogActions');
    setIsSettingsOpen(true);
  };

  const handleOpenQuickLogModal = (logType: string, defaultValues?: Record<string, any>) => {
    setQuickLogPreset({ type: logType, defaultValues });
    setIsQuickLogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
      <IndexHeader onSettingsClick={() => setIsSettingsOpen(true)} />

      <div className="relative p-4">
        <QuickActions 
          onQuickLogClick={() => setIsQuickLogOpen(true)}
          onNewTaskClick={() => setIsNewTaskOpen(true)}
        />

        <div className="mb-6">
          <AlertCards logs={logs} />
          <SmartReminders reminders={smartReminders} />
        </div>

        <UpcomingTasks
          tasks={tasks}
          loading={loading}
          onTaskCardClick={handleTaskCardClick}
          onEditTask={handleEditFromDetail}
          onNewTaskClick={() => setIsNewTaskOpen(true)}
          onToggleTaskCompletion={toggleTaskCompletion}
        />

        <RecentActivities
          recentActivities={recentActivities}
          loading={!initialLoadComplete}
          onLogCardClick={handleLogCardClick}
          onEditActivity={handleEditActivity}
          onQuickLogClick={() => setIsQuickLogOpen(true)}
        />
      </div>

      <QuickLogFAB 
        onLogAdded={handleQuickLogAdded}
        onOpenSettings={handleOpenQuickLogSettings}
        onOpenQuickLogModal={handleOpenQuickLogModal}
      />
      <BottomNav />
      <QuickLogModal
        isOpen={isQuickLogOpen}
        onClose={() => {
          setIsQuickLogOpen(false);
          setQuickLogPreset(null);
        }}
        onLogCreated={handleNewLogEntry}
        presetLogType={quickLogPreset?.type}
        presetDefaultValues={quickLogPreset?.defaultValues}
      />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => {
          setIsSettingsOpen(false);
          setSettingsInitialSection(undefined);
        }}
        initialSection={settingsInitialSection}
      />
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
