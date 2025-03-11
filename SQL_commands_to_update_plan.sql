
-- Check current plan for user
SELECT * FROM profiles WHERE email = 'tino@strasser.exchange';

-- Update to Expert plan if needed
UPDATE profiles 
SET plan = 'Enhance Stream Expert', 
    subscription_status = 'active' 
WHERE email = 'tino@strasser.exchange';

-- Verify that the change has been made
SELECT * FROM profiles WHERE email = 'tino@strasser.exchange';
