
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  cacheTasks,
  getCachedTasks,
  enqueueTask,
  getOutboxTasks,
  clearOutboxTasks,
} from '@/lib/offlineDB';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string; // ISO date string
  due_time: string | null;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  location?: string;
  quantity?: number;
  unit?: string;
  repeat_options?: any;
  created_at: string;
  updated_at: string;
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const syncOutbox = async () => {
    if (!navigator.onLine) return;
    const queued = await getOutboxTasks();
    if (!queued.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const q of queued) {
      try {
        await supabase.from('tasks').insert([{ ...q, user_id: user.id }]);
      } catch (err) {
        console.error('Failed to sync task', err);
      }
    }
    await clearOutboxTasks();
  };

  const fetchTasks = async () => {
    const cached = await getCachedTasks();
    if (cached.length) setTasks(cached);

    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    try {
      await syncOutbox();
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      const typed = (data || []).map(task => ({
        ...task,
        priority: task.priority as 'low' | 'medium' | 'high'
      }));
      setTasks(typed);
      await cacheTasks(typed);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!navigator.onLine) {
      const now = new Date().toISOString();
      await enqueueTask({ ...taskData, created_at: now, updated_at: now });
      const localTask: Task = {
        ...(taskData as Task),
        created_at: now,
        updated_at: now,
        id: `local-${Date.now()}`,
        priority: taskData.priority,
        completed: false,
      };
      setTasks(prev => [...prev, localTask]);
      toast({ title: 'Success', description: 'Task queued offline' });
      return localTask;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      const typedTask = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high'
      };

      setTasks(prev => [...prev, typedTask]);
      toast({
        title: "Success",
        description: "Task created successfully!"
      });

      return typedTask;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedTask = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high'
      };
      
      setTasks(prev => prev.map(task => task.id === id ? typedTask : task));
      toast({
        title: "Success",
        description: "Task updated successfully!"
      });
      
      return typedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== id));
      toast({
        title: "Success",
        description: "Task deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
      throw error;
    }
  };

  const toggleTaskCompletion = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    await updateTask(id, { completed: !task.completed });
  };

  useEffect(() => {
    fetchTasks();
    const onOnline = () => {
      fetchTasks();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refetch: fetchTasks
  };
};
