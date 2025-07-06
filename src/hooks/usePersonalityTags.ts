
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface PersonalityTag {
  id: string;
  name: string;
  color: string;
}

export const usePersonalityTags = () => {
  const [personalityTags, setPersonalityTags] = useState<PersonalityTag[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchPersonalityTags = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('personality_tags')
        .select('id, name, color')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      
      setPersonalityTags(data || []);
    } catch (error) {
      console.error('Error fetching personality tags:', error);
      toast({
        title: t("Error"),
        description: t("Failed to load personality tags"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addPersonalityTag = async (name: string, color: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('personality_tags')
        .insert([
          {
            user_id: user.id,
            name: name.trim(),
            color,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      const newTag = { id: data.id, name: data.name, color: data.color };
      setPersonalityTags(prev => [...prev, newTag]);
      
      toast({
        title: t("Success"),
        description: t("Personality tag added successfully"),
      });
      
      return newTag;
    } catch (error) {
      console.error('Error adding personality tag:', error);
      toast({
        title: t("Error"),
        description: t("Failed to add personality tag"),
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePersonalityTag = async (id: string, name: string, color: string) => {
    if (!user) return false;

    try {
      console.log('Updating tag in database:', { id, name, color }); // Debug log
      
      const { error } = await supabase
        .from('personality_tags')
        .update({ name: name.trim(), color })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      // Update local state immediately
      setPersonalityTags(prev => 
        prev.map(tag => 
          tag.id === id ? { ...tag, name: name.trim(), color } : tag
        )
      );
      
      console.log('Tag updated successfully in local state'); // Debug log
      
      toast({
        title: t("Success"),
        description: t("Personality tag updated successfully"),
      });
      
      return true;
    } catch (error) {
      console.error('Error updating personality tag:', error);
      toast({
        title: t("Error"),
        description: t("Failed to update personality tag"),
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePersonalityTag = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('personality_tags')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPersonalityTags(prev => prev.filter(tag => tag.id !== id));
      
      toast({
        title: t("Success"),
        description: t("Personality tag deleted successfully"),
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting personality tag:', error);
      toast({
        title: t("Error"),
        description: t("Failed to delete personality tag"),
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPersonalityTags();
    }
  }, [user]);

  return {
    personalityTags,
    loading,
    addPersonalityTag,
    updatePersonalityTag,
    deletePersonalityTag,
    refetch: fetchPersonalityTags,
  };
};
