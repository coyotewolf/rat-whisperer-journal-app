-- Update user role for coyote2025.0723@gmail.com to tester
UPDATE public.user_roles 
SET role = 'tester'::app_role 
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'coyote2025.0723@gmail.com'
);