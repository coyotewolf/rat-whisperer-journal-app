
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface LogTagCategory {
  id: string;
  name: string;
  display_name: string;
  color: string;
  is_default: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useLogTagCategories = () => {
  const [categories, setCategories] = useState<LogTagCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchCategories = async () => {
    if (!user) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('log_tag_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching log tag categories:', error);
      toast({
        title: t("Error"),
        description: t("Failed to fetch log tag categories"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async (name: string, displayName: string, color: string = '#6B7280') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('log_tag_categories')
        .insert({
          user_id: user.id,
          name: name.trim().toLowerCase(),
          display_name: displayName.trim(),
          color,
          is_default: false,
        })
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({
        title: t("Success"),
        description: t("Category added successfully"),
      });

      return data;
    } catch (error) {
      console.error('Error adding log tag category:', error);
      toast({
        title: t("Error"),
        description: t("Failed to add category"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, displayName: string, color?: string) => {
    if (!user) return;

    try {
      const updateData: any = { display_name: displayName.trim() };
      if (color !== undefined) {
        updateData.color = color;
      }

      const { data, error } = await supabase
        .from('log_tag_categories')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => 
        prev.map(c => c.id === id ? data : c).sort((a, b) => a.name.localeCompare(b.name))
      );

      toast({
        title: t("Success"),
        description: t("Category updated successfully"),
      });

      return data;
    } catch (error) {
      console.error('Error updating log tag category:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update category"),
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('log_tag_categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCategories(prev => prev.filter(c => c.id !== id));
      toast({
        title: t("Success"),
        description: t("Category deleted successfully"),
      });
    } catch (error) {
      console.error('Error deleting log tag category:', error);
      toast({
        title: t("Error"),
        description: t("Failed to delete category"),
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories: fetchCategories,
  };
};
