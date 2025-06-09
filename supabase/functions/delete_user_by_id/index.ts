import { createClient } from '@supabase/supabase-js';

// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const { user_id_to_delete } = await req.json();

  if (!user_id_to_delete) {
    return new Response('Missing user_id_to_delete', { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    return new Response(
      JSON.stringify({ error: 'Server configuration error. Please contact support.' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Validate user_id_to_delete format (UUID)
    if (!isValidUUID(user_id_to_delete)) {
      return new Response(JSON.stringify({ error: 'Invalid user_id_to_delete format. Must be a valid UUID.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

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