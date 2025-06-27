/*
  # Add trial period to subscription system

  1. New Views
    - Update stripe_user_subscriptions view to include trial information
  
  2. Security
    - Maintain existing RLS policies
*/

-- Update the stripe_user_subscriptions view to include trial information
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT 
  sc.customer_id,
  ss.subscription_id,
  ss.status as subscription_status,
  ss.price_id,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  CASE 
    WHEN ss.status = 'trialing' THEN 
      EXTRACT(DAY FROM (to_timestamp(ss.current_period_end) - CURRENT_TIMESTAMP))::integer
    ELSE NULL
  END as trial_days_remaining
FROM 
  stripe_customers sc
JOIN 
  stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE 
  sc.deleted_at IS NULL
  AND ss.deleted_at IS NULL;