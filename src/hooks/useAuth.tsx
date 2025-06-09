
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

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

    // Default personality tags are now handled automatically by the database trigger
    return { error: null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const reauthenticate = async (password: string) => {
    if (!user?.email) {
      return { error: { message: "User email not found for reauthentication." } };
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    return { error };
  };

  const deleteAccount = async () => {
    if (!user) {
      return { error: { message: "No user is currently signed in." } };
    }

    const userId = user.id;

    try {
      // Delete user-specific data from all relevant tables
      await supabase.from('rats').delete().eq('user_id', userId);
      await supabase.from('log_entries').delete().eq('user_id', userId);
      await supabase.from('personality_tags').delete().eq('user_id', userId);
      await supabase.from('tasks').delete().eq('user_id', userId);
      await supabase.from('task_suggestions').delete().eq('user_id', userId);
      await supabase.from('log_tag_suggestions').delete().eq('user_id', userId);

      // Finally, delete the user from Supabase Auth
      const { error: deleteUserError } = await supabase.rpc('delete_user_by_id', { user_id_to_delete: userId });

      if (deleteUserError) {
        throw deleteUserError;
      }

      // Sign out the user after successful deletion
      await signOut();

      return { error: null };
    } catch (error: any) {
      console.error("Error deleting account:", error);
      return { error: { message: error.message || "An unexpected error occurred during account deletion." } };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    reauthenticate,
    deleteAccount,
  };
};
