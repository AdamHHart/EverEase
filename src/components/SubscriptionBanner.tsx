import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Clock, CreditCard, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SubscriptionBannerProps {
  className?: string;
}

export default function SubscriptionBanner({ className }: SubscriptionBannerProps) {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show for planners, not executors
    if (userRole !== 'planner') {
      setLoading(false);
      return;
    }

    // Check if banner was dismissed in this session
    const isDismissed = sessionStorage.getItem('subscription_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [user, userRole]);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('subscription_banner_dismissed', 'true');
  };

  // Don't show if loading, dismissed, or not a planner
  if (loading || dismissed || userRole !== 'planner') {
    return null;
  }

  // Don't show if user has an active subscription
  if (subscription?.subscription_status === 'active' || 
      subscription?.subscription_status === 'trialing') {
    return null;
  }

  // Calculate days left in trial if applicable
  const daysLeft = subscription?.subscription_status === 'trialing' && subscription?.current_period_end
    ? Math.max(0, Math.floor((subscription.current_period_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // Show different banner based on subscription status
  if (subscription?.subscription_status === 'trialing') {
    return (
      <Card className={`border-amber-300 bg-amber-50 ${className}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">
                {daysLeft === 1 
                  ? 'Your free trial ends tomorrow!' 
                  : `${daysLeft} days left in your free trial`}
              </p>
              <p className="text-sm text-amber-700">
                Add your payment details to continue using all features after your trial ends.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDismiss}
              className="text-amber-700 border-amber-300"
            >
              Dismiss
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/payment')}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner for users without subscription
  return (
    <Card className={`border-amber-300 bg-amber-50 ${className}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-900">
              Your account requires a subscription
            </p>
            <p className="text-sm text-amber-700">
              Start your 14-day free trial to access all features and secure your end-of-life plan.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDismiss}
            className="text-amber-700 border-amber-300"
          >
            Dismiss
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/payment')}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Start Free Trial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}