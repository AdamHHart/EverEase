import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { createPaymentIntent } from '../../lib/stripe';
import { toast } from '../ui/toast';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';

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
      // Create a payment intent on the server
      const { clientSecret } = await createPaymentIntent(amount, currency, {
        product: productName
      });

      // Use the client secret to confirm the payment
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Ever Ease User', // In a real app, you'd collect this from the user
          },
        }
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        toast({
          title: "Payment successful!",
          description: `Your payment of ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} has been processed.`,
        });
        
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : 'An unknown error occurred',
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
              <div className="p-3 border rounded-md bg-white">
                <CardElement options={cardElementOptions} />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Total:</span>
              <span className="font-bold">{(amount / 100).toFixed(2)} {currency.toUpperCase()}</span>
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
                {loading ? 'Processing...' : `Pay ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`}
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