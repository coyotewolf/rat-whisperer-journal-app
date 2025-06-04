
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TaskSuggestion {
  id: string;
  name: string;
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  quantity?: number;
  unit?: string;
  created_at: string;
  updated_at: string;
}

export const useTaskSuggestions = () => {
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('task_suggestions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      // Type cast the data to match our interface
      setSuggestions((data || []).map(suggestion => ({
        ...suggestion,
        priority: suggestion.priority ? suggestion.priority as 'low' | 'medium' | 'high' : undefined
      })));
    } catch (error) {
      console.error('Error fetching task suggestions:', error);
      // Create default suggestions if none exist
      await createDefaultSuggestions();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const defaultSuggestions = [
        { name: "Cage Cleaning", title: "Perform cage cleaning", priority: 'medium' as const },
        { name: "Vet Appointment", title: "Vet Appointment for [Rat Name]", priority: 'high' as const },
        { name: "Bedding Restock", title: "Restock bedding supplies", priority: 'low' as const },
        { name: "Food Restock", title: "Restock rat food", priority: 'medium' as const },
        { name: "Water Refill", title: "Refill water bottles", priority: 'medium' as const },
        { name: "Playtime", title: "Schedule playtime", priority: 'low' as const },
      ];

      const { data, error } = await supabase
        .from('task_suggestions')
        .insert(defaultSuggestions.map(suggestion => ({
          ...suggestion,
          user_id: user.id
        })))
        .select();

      if (error) throw error;
      // Type cast the data to match our interface
      setSuggestions((data || []).map(suggestion => ({
        ...suggestion,
        priority: suggestion.priority ? suggestion.priority as 'low' | 'medium' | 'high' : undefined
      })));
    } catch (error) {
      console.error('Error creating default suggestions:', error);
    }
  };

  const createSuggestion = async (suggestionData: Omit<TaskSuggestion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('task_suggestions')
        .insert([{
          ...suggestionData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedSuggestion = {
        ...data,
        priority: data.priority ? data.priority as 'low' | 'medium' | 'high' : undefined
      };
      
      setSuggestions(prev => [...prev, typedSuggestion]);
      toast({
        title: "Success",
        description: "Task suggestion created successfully!"
      });
      
      return typedSuggestion;
    } catch (error) {
      console.error('Error creating task suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to create task suggestion",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateSuggestion = async (id: string, updates: Partial<TaskSuggestion>) => {
    try {
      const { data, error } = await supabase
        .from('task_suggestions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Type cast the data to match our interface
      const typedSuggestion = {
        ...data,
        priority: data.priority ? data.priority as 'low' | 'medium' | 'high' : undefined
      };
      
      setSuggestions(prev => prev.map(suggestion => suggestion.id === id ? typedSuggestion : suggestion));
      toast({
        title: "Success",
        description: "Task suggestion updated successfully!"
      });
      
      return typedSuggestion;
    } catch (error) {
      console.error('Error updating task suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to update task suggestion",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteSuggestion = async (id: string) => {
    try {
      const { error } = await supabase
        .from('task_suggestions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setSuggestions(prev => prev.filter(suggestion => suggestion.id !== id));
      toast({
        title: "Success",
        description: "Task suggestion deleted successfully!"
      });
    } catch (error) {
      console.error('Error deleting task suggestion:', error);
      toast({
        title: "Error",
        description: "Failed to delete task suggestion",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return {
    suggestions,
    loading,
    createSuggestion,
    updateSuggestion,
    deleteSuggestion,
    refetch: fetchSuggestions
  };
};
