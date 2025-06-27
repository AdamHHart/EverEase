import { loadStripe, Stripe } from '@stripe/stripe-js';
import { supabase } from './supabase';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };

// Helper function to create a checkout session
export const createCheckoutSession = async (
  priceId: string, 
  mode: 'payment' | 'subscription' = 'subscription',
  trialPeriodDays?: number
) => {
  try {
    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Failed to authenticate user');
    }

    // Get the current URL to use for success and cancel URLs
    const origin = window.location.origin;
    const successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/payment/cancel`;

    // Call the Supabase Edge Function to create a checkout session
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        mode,
        trial_period_days: trialPeriodDays
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create checkout session');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Helper function to get subscription status
export const getSubscriptionStatus = async () => {
  try {
    const { data: authData, error: authError } = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/stripe_user_subscriptions?select=*`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`,
      },
    }).then(res => res.json());

    if (authError) throw authError;
    
    return authData && authData.length > 0 ? authData[0] : null;
  } catch (error) {
    console.error('Error getting subscription status:', error);
    return null;
  }
};

// Helper function to get payment method details
export const getPaymentMethod = async (paymentMethodId: string) => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Failed to authenticate user');
    }

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-payment-method`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get payment method');
    }

    const data = await response.json();
    return data.paymentMethod;
  } catch (error) {
    console.error('Error getting payment method:', error);
    throw error;
  }
};