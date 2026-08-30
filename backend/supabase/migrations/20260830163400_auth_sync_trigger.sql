-- Trigger to automatically create a user in public.users when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, designation)
  VALUES (
    new.id,
    new.email,
    -- Attempt to get full name from metadata, fallback to email prefix if not available
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'designation', 'User')
  );
  
  -- Note: Role assignment is typically handled via an admin dashboard or a separate process, 
  -- but we can set a default role here if needed by inserting into public.user_roles.
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
