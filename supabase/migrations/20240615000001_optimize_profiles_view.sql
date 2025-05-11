
-- Optimize the profiles_with_limit view with COALESCE for NULL safety
CREATE OR REPLACE VIEW profiles_with_limit AS
SELECT
  p.id,
  p.plan,
  p.subscription_status,
  COALESCE(p.viewers_active, 0) AS viewers_active,
  COALESCE(p.chatters_active, 0) AS chatters_active,
  p.is_admin, -- Explizit das is_admin Feld einschließen
  -- Viewer Limit
  CASE
    WHEN p.subscription_status != 'active' THEN 4
    WHEN p.plan ILIKE '%Ultimate%' THEN 1000
    WHEN p.plan ILIKE '%Expert%' THEN 300
    WHEN p.plan ILIKE '%Professional%' THEN 200
    WHEN p.plan ILIKE '%Basic%' THEN 50
    WHEN p.plan ILIKE '%Starter%' THEN 25
    ELSE 4
  END AS computed_viewer_limit,
  -- Chatter Limit
  CASE
    WHEN p.subscription_status != 'active' THEN 1
    WHEN p.plan ILIKE '%Ultimate%' THEN 100
    WHEN p.plan ILIKE '%Expert%' THEN 50
    WHEN p.plan ILIKE '%Professional%' THEN 25
    WHEN p.plan ILIKE '%Basic%' THEN 10
    WHEN p.plan ILIKE '%Starter%' THEN 5
    ELSE 1
  END AS chatter_limit
FROM public.profiles p;
