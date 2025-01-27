-- Add new columns to profiles table for Stripe integration
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

-- Add an index on stripe_customer_id for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id 
ON profiles(stripe_customer_id);

-- Add an index on subscription_status for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status 
ON profiles(subscription_status);