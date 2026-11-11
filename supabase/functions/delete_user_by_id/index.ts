import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
// Helper function to validate UUID
function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(uuid);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  let user_id_to_delete: unknown;
  try {
    ({ user_id_to_delete } = await req.json());
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  if (!user_id_to_delete) {
    return new Response('Missing user_id_to_delete', { 
      status: 400,
      headers: corsHeaders 
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
    return new Response(
      JSON.stringify({ error: 'Server configuration error. Please contact support.' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const authorization = req.headers.get('Authorization') || '';
    const token = authorization.match(/^Bearer\s+(\S+)$/i)?.[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate with Auth; never trust a client-supplied id or decode JWTs locally.
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (user.id !== user_id_to_delete) {
      return new Response(JSON.stringify({ error: 'You may only delete your own account' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Validate user_id_to_delete format (UUID)
    if (typeof user_id_to_delete !== 'string' || !isValidUUID(user_id_to_delete)) {
      return new Response(JSON.stringify({ error: 'Invalid user_id_to_delete format. Must be a valid UUID.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Delete user from auth.users table
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user_id_to_delete);

    if (authError) {
      console.error('Error deleting user from auth:', authError);
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Optionally, delete user's data from other tables if not handled by RLS or triggers
    // For example:
    // await supabaseAdmin.from('profiles').delete().eq('id', user_id_to_delete);
    // await supabaseAdmin.from('user_data').delete().eq('user_id', user_id_to_delete);

    return new Response(JSON.stringify({ message: 'User and associated data deleted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});