import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export { stripePromise };

// Helper function to create a checkout session
export const createCheckoutSession = async (priceId: string, mode: 'payment' | 'subscription' = 'subscription') => {
  try {
    // Get the current URL to use for success and cancel URLs
    const origin = window.location.origin;
    const successUrl = `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/payment/cancel`;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        mode,
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