import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const navigate = useNavigate();

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
            <AlertCircle className="h-16 w-16 text-amber-500" />
            <span>Payment Cancelled</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            Your payment process was cancelled. No charges have been made to your account.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-amber-900 mb-2">Need Help?</h3>
            <p className="text-sm text-amber-800 mb-2">
              If you encountered any issues during the payment process or have questions about our membership, please don't hesitate to contact our support team.
            </p>
            <p className="text-sm text-amber-800">
              You can also try again by clicking the button below.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
            <Button onClick={() => navigate('/payment')}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}