
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface LogTagSuggestion {
  id: string;
  name: string;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useLogTagSuggestions = () => {
  const [suggestions, setSuggestions] = useState<LogTagSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchSuggestions = async () => {
    if (!user) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('log_tag_suggestions')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching log tag suggestions:', error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch log tag suggestions"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSuggestion = async (name: string, color: string = '#6B7280') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('log_tag_suggestions')
        .insert({
          user_id: user.id,
          name: name.trim(),
          color,
        })
        .select()
        .single();

      if (error) throw error;

      setSuggestions(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast({
        title: t("Success"),
        description: t("Tag suggestion added successfully"),
      });

      return data;
    } catch (error) {
      console.error('Error adding log tag suggestion:', error);
      toast({
        title: t("Error"),
        description: t("Failed to add tag suggestion"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSuggestion = async (id: string, name: string, color?: string) => {
    if (!user) return;

    try {
      const updateData: any = { name: name.trim() };
      if (color !== undefined) {
        updateData.color = color;
      }

      const { data, error } = await supabase
        .from('log_tag_suggestions')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSuggestions(prev => 
        prev.map(s => s.id === id ? data : s).sort((a, b) => a.name.localeCompare(b.name))
      );

      toast({
        title: t("Success"),
        description: t("Tag suggestion updated successfully"),
      });

      return data;
    } catch (error) {
      console.error('Error updating log tag suggestion:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update tag suggestion"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteSuggestion = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('log_tag_suggestions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSuggestions(prev => prev.filter(s => s.id !== id));
      toast({
        title: t("Success"),
        description: t("Tag suggestion deleted successfully"),
      });
    } catch (error) {
      console.error('Error deleting log tag suggestion:', error);
      toast({
        title: t("Error"),
        description: t("Failed to delete tag suggestion"),
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  return {
    suggestions,
    loading,
    addSuggestion,
    updateSuggestion,
    deleteSuggestion,
    refreshSuggestions: fetchSuggestions,
  };
};
