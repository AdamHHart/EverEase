import { ReactNode, useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';
import { Card, CardContent } from '../ui/card';
import { AlertCircle } from 'lucide-react';

interface StripeProviderProps {
  children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Stripe is properly configured
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe publishable key is not configured. Please check your environment variables.');
    } else if (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('sk_')) {
      setStripeError('You are using a secret key with Stripe.js. Please use a publishable key instead.');
    }
  }, []);

  // Define appearance and other options for Stripe Elements
  const options = {
    fonts: [
      {
        cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
      },
    ],
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#ffffff',
        colorText: '#424770',
        colorDanger: '#df1b41',
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };

  if (stripeError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <h3 className="font-medium text-red-800">Stripe Configuration Error</h3>
              <p className="text-sm text-red-700 mt-1">{stripeError}</p>
              <p className="text-sm text-red-700 mt-1">
                Please check your .env file and ensure VITE_STRIPE_PUBLISHABLE_KEY is set correctly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}