-- Ensure coyote2025.0723@gmail.com has tester role
DO $$
DECLARE
  uid uuid;
BEGIN
  SELECT id INTO uid FROM auth.users WHERE email = 'coyote2025.0723@gmail.com' LIMIT 1;

  IF uid IS NULL THEN
    RAISE NOTICE 'No user found with that email';
  ELSE
    -- If a role row exists, update it; otherwise insert
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = uid) THEN
      UPDATE public.user_roles SET role = 'tester'::app_role WHERE user_id = uid;
    ELSE
      INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'tester'::app_role);
    END IF;
  END IF;
END $$;
