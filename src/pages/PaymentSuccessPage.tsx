import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found');
      setLoading(false);
      return;
    }

    // In a real implementation, you might want to verify the session with your backend
    // For now, we'll just simulate a loading state
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [location]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex flex-col items-center gap-4">
            {loading ? (
              <>
                <Loader2 className="h-16 w-16 text-calm-500 animate-spin" />
                <span>Confirming your payment...</span>
              </>
            ) : error ? (
              <>
                <div className="text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                </div>
                <span>Payment Error</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-green-500" />
                <span>Payment Successful!</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {loading ? (
            <p className="text-gray-600">
              Please wait while we confirm your payment...
            </p>
          ) : error ? (
            <>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => navigate('/payment')}>
                Try Again
              </Button>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                Thank you for your purchase! Your EverEase membership is now active.
                You now have access to all premium features.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-green-900 mb-2">What's Next?</h3>
                <ul className="text-sm text-green-800 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Explore your new premium features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Complete your end-of-life planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                    <span>Invite your executors to the platform</span>
                  </li>
                </ul>
              </div>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}