
-- This migration sets the Expert plan for the admin user
UPDATE profiles 
SET plan = 'Enhance Stream Expert', 
    subscription_status = 'active',
    current_period_end = (NOW() + INTERVAL '1 year')
WHERE email = 'tino@strasser.exchange';

-- Set the follower plan if needed
UPDATE profiles
SET follower_plan = 'Follower Elite'
WHERE email = 'tino@strasser.exchange';
