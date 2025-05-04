
-- Add viewers_active column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS viewers_active INTEGER DEFAULT 0;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_viewers_active ON profiles(viewers_active);

-- Create a secure function to increment active viewers
CREATE OR REPLACE FUNCTION increment_viewer_count(user_id UUID, count INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  plan_limit INTEGER;
  new_count INTEGER;
BEGIN
  -- Get the current count and plan limit
  SELECT viewers_active, 
    CASE 
      WHEN subscription_status = 'active' THEN
        CASE 
          WHEN plan LIKE '%Ultimate%' THEN 1000
          WHEN plan LIKE '%Expert%' THEN 300
          WHEN plan LIKE '%Professional%' THEN 200
          WHEN plan LIKE '%Basic%' THEN 50
          WHEN plan LIKE '%Starter%' THEN 25
          ELSE 4
        END
      ELSE 4
    END INTO current_count, plan_limit
  FROM profiles
  WHERE id = user_id;
  
  -- Calculate new count, ensuring it doesn't exceed the plan limit
  new_count := LEAST(plan_limit, current_count + count);
  
  -- Update the count
  UPDATE profiles
  SET viewers_active = new_count
  WHERE id = user_id;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to decrement active viewers
CREATE OR REPLACE FUNCTION decrement_viewer_count(user_id UUID, count INTEGER)
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
  new_count INTEGER;
BEGIN
  -- Get the current count
  SELECT viewers_active INTO current_count
  FROM profiles
  WHERE id = user_id;
  
  -- Calculate new count, ensuring it doesn't go below zero
  new_count := GREATEST(0, current_count - count);
  
  -- Update the count
  UPDATE profiles
  SET viewers_active = new_count
  WHERE id = user_id;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to reset viewer count to zero
CREATE OR REPLACE FUNCTION reset_viewer_count(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET viewers_active = 0
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
