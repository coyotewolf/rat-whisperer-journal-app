
import { useState } from "react";
import type { Task } from "@/hooks/useTasks";

export const useIndexModals = () => {
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

  return {
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
  };
};
