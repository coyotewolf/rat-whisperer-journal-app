
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  cacheTasks,
  getCachedTasks,
  enqueueTask,
  getOutboxTasks,
  clearOutboxTasks,
  enqueueTaskUpdate,
  getOutboxTaskUpdates,
  clearOutboxTaskUpdates,
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
    const updateQueued = await getOutboxTaskUpdates();
    if (!queued.length && !updateQueued.length) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    for (const q of queued) {
      try {
        await supabase.from('tasks').insert([{ ...q, user_id: user.id }]);
      } catch (err) {
        console.error('Failed to sync task', err);
      }
    }
    for (const up of updateQueued) {
      try {
        const { data: existing } = await supabase
          .from('tasks')
          .select('updated_at')
          .eq('id', up.id)
          .maybeSingle();
        if (existing && new Date(existing.updated_at) > new Date(up.updated_at)) {
          console.warn('Server has newer task version for', up.id);
          continue;
        }
        await supabase.from('tasks').update({ ...up.updates, updated_at: up.updated_at }).eq('id', up.id);
      } catch (err) {
        console.error('Failed to sync task update', err);
      }
    }
    await clearOutboxTasks();
    await clearOutboxTaskUpdates();
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
        priority: task.priority as 'low' | 'medium' | 'high',
        completed: task.completed ?? task.is_completed ?? false
      })) as Task[];
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

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id, updated_at: now }])
        .select()
        .single();

      if (error) throw error;

      const typedTask = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high',
        completed: (data as any).completed ?? (data as any).is_completed ?? false
      } as Task;

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
    if (!navigator.onLine) {
      const updated_at = new Date().toISOString();
      await enqueueTaskUpdate({ id, updates, updated_at });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updated_at } : t));
      toast({ title: 'Success', description: 'Task update queued offline' });
      return { ...(tasks.find(t => t.id === id) as Task), ...updates, updated_at };
    }

    try {
      const updated_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedTask = {
        ...data,
        priority: data.priority as 'low' | 'medium' | 'high',
        completed: (data as any).completed ?? (data as any).is_completed ?? false
      } as Task;
      
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
    const channel = supabase
      .channel('tasks-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasks();
      })
      .subscribe();
    return () => {
      window.removeEventListener('online', onOnline);
      supabase.removeChannel(channel);
    };
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
