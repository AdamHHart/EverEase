import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice } from '../stripe-config';

interface Subscription {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('stripe_user_subscriptions')
          .select('*')
          .maybeSingle();
        
        if (error) throw error;
        setSubscription(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscription();
  }, [user]);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStatusDisplay = () => {
    if (!subscription || !subscription.subscription_id) {
      return {
        label: 'Free Plan',
        color: 'text-gray-600 bg-gray-100',
        description: 'You are currently on the free plan'
      };
    }

    switch (subscription.subscription_status) {
      case 'active':
        return {
          label: 'Active',
          color: 'text-green-600 bg-green-100',
          description: 'Your subscription is active'
        };
      case 'trialing':
        return {
          label: 'Trial',
          color: 'text-blue-600 bg-blue-100',
          description: 'Your trial is active'
        };
      case 'past_due':
        return {
          label: 'Past Due',
          color: 'text-amber-600 bg-amber-100',
          description: 'Your payment is past due'
        };
      case 'canceled':
        return {
          label: 'Canceled',
          color: 'text-red-600 bg-red-100',
          description: 'Your subscription has been canceled'
        };
      default:
        return {
          label: subscription.subscription_status,
          color: 'text-gray-600 bg-gray-100',
          description: 'Subscription status'
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-calm-500" />
        </CardContent>
      </Card>
    );
  }

  const status = getStatusDisplay();
  const isActive = subscription?.subscription_status === 'active';
  const isTrialing = subscription?.subscription_status === 'trialing';
  const hasActiveSubscription = isActive || isTrialing;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-calm-500" />
          Membership Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            <span className="text-sm text-gray-600">{status.description}</span>
          </div>
          
          {!hasActiveSubscription && (
            <Button 
              size="sm" 
              onClick={() => navigate('/payment')}
              className="bg-calm-500 hover:bg-calm-600"
            >
              Upgrade
            </Button>
          )}
        </div>
        
        {hasActiveSubscription && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current period</span>
                <span>
                  {formatDate(subscription?.current_period_start)} - {formatDate(subscription?.current_period_end)}
                </span>
              </div>
              
              {subscription?.payment_method_last4 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment method</span>
                  <span className="capitalize">
                    {subscription.payment_method_brand} •••• {subscription.payment_method_last4}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Auto-renewal</span>
                <span>{subscription?.cancel_at_period_end ? 'Off' : 'On'}</span>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/account/billing')}
              >
                Manage Subscription
              </Button>
            </div>
          </>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}