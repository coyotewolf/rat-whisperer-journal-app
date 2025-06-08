
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import { PersonalityTag } from '@/components/PersonalityTagManager'; // Import PersonalityTag interface

const defaultPersonalityTags: Omit<PersonalityTag, 'id'>[] = [
  { name: "Curious", color: "blue" },
  { name: "Shy", color: "purple" },
  { name: "Aggressive", color: "red" },
  { name: "Calm", color: "green" },
  { name: "Adventurous", color: "orange" },
  { name: "Vocal", color: "yellow" },
  { name: "Friendly", color: "pink" },
  { name: "Dominant", color: "gray" },
  { name: "Anxious", color: "indigo" },
  { name: "Playful", color: "cyan" },
  { name: "Independent", color: "teal" },
  { name: "Affectionate", color: "rose" },
  { name: "Energetic", color: "lime" },
  { name: "Lazy", color: "brown" },
  { name: "Smart", color: "amber" },
  { name: "Stubborn", color: "fuchsia" },
];

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      return { error };
    }

    // If signup is successful, insert default personality tags
    if (data.user) {
      const tagsToInsert = defaultPersonalityTags.map(tag => ({
        ...tag,
        user_id: data.user!.id,
      }));

      const { error: insertError } = await supabase
        .from('personality_tags')
        .insert(tagsToInsert);

      if (insertError) {
        console.error("Error inserting default personality tags:", insertError);
        // Optionally, handle this error more gracefully, e.g., log to a monitoring service
      }
    }

    return { error: null }; // Return null error if signup and tag insertion are successful
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
