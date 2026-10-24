-- Apply in the active Rat Care Supabase database; no user data is deleted by this script.
BEGIN;
CREATE OR REPLACE FUNCTION public.delete_user_by_id(user_id_to_delete uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM user_id_to_delete THEN
    RAISE EXCEPTION 'Not authorized to delete this user' USING ERRCODE = '42501';
  END IF;
  DELETE FROM auth.users WHERE id = user_id_to_delete;
END;
$function$;
REVOKE ALL ON FUNCTION public.delete_user_by_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_by_id(uuid) TO authenticated;
COMMIT;
