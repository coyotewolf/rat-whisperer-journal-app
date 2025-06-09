import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.1';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { user_id_to_delete } = await req.json();

  if (!user_id_to_delete) {
    return new Response('Missing user_id_to_delete', { status: 400 });
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Delete user from auth.users table
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user_id_to_delete);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Optionally, delete user's data from other tables if not handled by RLS or triggers
    // For example:
    // await supabaseAdmin.from('profiles').delete().eq('id', user_id_to_delete);
    // await supabaseAdmin.from('user_data').delete().eq('user_id', user_id_to_delete);

    return new Response(JSON.stringify({ message: 'User and associated data deleted successfully' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});