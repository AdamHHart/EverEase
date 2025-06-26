import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CreditCard, ShieldCheck, CheckCircle, ArrowLeft } from 'lucide-react';
import StripeProvider from '../components/payments/StripeProvider';
import CheckoutForm from '../components/payments/CheckoutForm';
import PaymentMethodSelector from '../components/payments/PaymentMethodSelector';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkout');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [paymentComplete, setPaymentComplete] = useState(false);

  // Example product data - in a real app, this would come from your backend
  const product = {
    name: 'Premium Plan',
    description: 'Access to all features and premium support',
    amount: 2999, // $29.99 in cents
    currency: 'usd'
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId);
    setPaymentComplete(true);
    
    // In a real app, you would update the user's subscription status in your database
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Payment</h1>
          <p className="text-gray-500">Complete your purchase securely</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <StripeProvider>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="checkout" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  New Payment
                </TabsTrigger>
                <TabsTrigger value="saved" className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Saved Methods
                </TabsTrigger>
              </TabsList>

              <TabsContent value="checkout" className="mt-6">
                {paymentComplete ? (
                  <Card>
                    <CardContent className="pt-6 pb-6 text-center">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
                      <p className="text-gray-600 mb-6">
                        Thank you for your purchase. Your premium features are now active.
                      </p>
                      <Button onClick={() => navigate('/dashboard')}>
                        Return to Dashboard
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <CheckoutForm 
                    amount={product.amount}
                    currency={product.currency}
                    productName={product.name}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => navigate('/dashboard')}
                  />
                )}
              </TabsContent>

              <TabsContent value="saved" className="mt-6">
                <PaymentMethodSelector 
                  customerId={user?.id || ''}
                  onSelectPaymentMethod={setSelectedPaymentMethod}
                  selectedPaymentMethodId={selectedPaymentMethod}
                />
                
                {selectedPaymentMethod && (
                  <div className="mt-6">
                    <Button 
                      className="w-full"
                      onClick={() => {
                        // In a real app, you would process the payment with the selected payment method
                        handlePaymentSuccess('pi_mock_payment_intent_id');
                      }}
                    >
                      Pay with Selected Method
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </StripeProvider>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>{product.name}</span>
                <span>${(product.amount / 100).toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>Total</span>
                <span>${(product.amount / 100).toFixed(2)}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 border-t">
              <div className="text-sm text-gray-600 space-y-2 w-full">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Secure payment processing by Stripe</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                  <span>Instant access to premium features</span>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">What's included:</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Advanced AI document analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Unlimited document storage</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Priority customer support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                <span>Advanced executor tools</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}