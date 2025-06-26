import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// In production, this should be an environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

export { stripePromise };

// Helper function to create a payment intent
export const createPaymentIntent = async (amount: number, currency: string = 'usd', metadata: Record<string, string> = {}) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Helper function to get payment method details
export const getPaymentMethod = async (paymentMethodId: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-payment-method`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethodId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get payment method');
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting payment method:', error);
    throw error;
  }
};