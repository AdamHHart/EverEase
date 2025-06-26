import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { createCheckoutSession } from '../../lib/stripe';
import { products } from '../../stripe-config';
import { toast } from '../ui/toast';
import { AlertCircle, CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  amount: number;
  currency?: string;
  productName: string;
  onSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
}

export default function CheckoutForm({ 
  amount, 
  currency = 'usd', 
  productName,
  onSuccess,
  onCancel
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a checkout session using our edge function
      const { sessionId, url } = await createCheckoutSession(
        products.membership.priceId,
        products.membership.mode
      );

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        fontFamily: 'Inter, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
        padding: '10px 12px',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-calm-500" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          Create your membership. Members can be at ease, as your loved ones will be taken care of.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {succeeded ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-900">Payment Successful</h3>
              <p className="text-sm text-green-700">
                Your payment of {(amount / 100).toFixed(2)} {currency.toUpperCase()} has been processed successfully.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Card Details
              </label>
              <div className="p-4 border rounded-md bg-white min-h-[40px]">
                <CardElement options={cardElementOptions} />
              </div>
              <p className="text-xs text-gray-500">
                Test card: 4242 4242 4242 4242 | Exp: Any future date | CVC: Any 3 digits
              </p>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total:</span>
              <span className="font-bold">{(amount / 100).toFixed(2)} {currency.toUpperCase()}/month</span>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <div className="flex gap-3">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={!stripe || loading}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Subscribe for $${(amount / 100).toFixed(2)}/${currency.toUpperCase()} monthly`
                )}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <div className="text-xs text-gray-500 flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          Secured by Stripe
        </div>
      </CardFooter>
    </Card>
  );
}