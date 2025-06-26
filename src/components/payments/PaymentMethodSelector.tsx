import { useState, useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { getPaymentMethod } from '../../lib/stripe';
import { toast } from '../ui/toast';

interface PaymentMethodSelectorProps {
  customerId: string;
  onSelectPaymentMethod: (paymentMethodId: string) => void;
  selectedPaymentMethodId?: string;
}

interface PaymentMethod {
  id: string;
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export default function PaymentMethodSelector({
  customerId,
  onSelectPaymentMethod,
  selectedPaymentMethodId
}: PaymentMethodSelectorProps) {
  const stripe = useStripe();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stripe) return;
    
    const fetchPaymentMethods = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, you would fetch this from your backend
        // This is a simplified example
        const mockPaymentMethods = [
          {
            id: 'pm_123456789',
            card: {
              brand: 'visa',
              last4: '4242',
              exp_month: 12,
              exp_year: 2025
            }
          },
          {
            id: 'pm_987654321',
            card: {
              brand: 'mastercard',
              last4: '5555',
              exp_month: 10,
              exp_year: 2024
            }
          }
        ];
        
        setPaymentMethods(mockPaymentMethods);
        
        // If there's a payment method and none is selected, select the first one
        if (mockPaymentMethods.length > 0 && !selectedPaymentMethodId) {
          onSelectPaymentMethod(mockPaymentMethods[0].id);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        toast({
          title: "Error",
          description: "Failed to load payment methods",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentMethods();
  }, [stripe, customerId, onSelectPaymentMethod, selectedPaymentMethodId]);

  const handleAddPaymentMethod = async () => {
    if (!stripe) return;
    
    try {
      // In a real implementation, you would redirect to a payment method form
      // or open a modal with a Stripe Elements form
      toast({
        title: "Add Payment Method",
        description: "This would open a form to add a new payment method",
      });
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive"
      });
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    try {
      // In a real implementation, you would call your backend to detach the payment method
      toast({
        title: "Remove Payment Method",
        description: "This would remove the selected payment method",
      });
      
      // Update the local state to remove the payment method
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== paymentMethodId));
      
      // If the removed payment method was selected, select another one if available
      if (selectedPaymentMethodId === paymentMethodId) {
        const remainingMethods = paymentMethods.filter(pm => pm.id !== paymentMethodId);
        if (remainingMethods.length > 0) {
          onSelectPaymentMethod(remainingMethods[0].id);
        } else {
          onSelectPaymentMethod('');
        }
      }
    } catch (error) {
      console.error('Error removing payment method:', error);
      toast({
        title: "Error",
        description: "Failed to remove payment method",
        variant: "destructive"
      });
    }
  };

  const getCardBrandIcon = (brand: string) => {
    // In a real implementation, you might want to use actual card brand icons
    return <CreditCard className="h-5 w-5" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-pulse h-8 w-8 rounded-full bg-calm-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-calm-500" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No payment methods added yet</p>
            <Button 
              onClick={handleAddPaymentMethod}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  className={`p-4 border rounded-lg flex justify-between items-center cursor-pointer ${
                    selectedPaymentMethodId === method.id ? 'border-calm-500 bg-calm-50' : 'border-gray-200'
                  }`}
                  onClick={() => onSelectPaymentMethod(method.id)}
                >
                  <div className="flex items-center gap-3">
                    {getCardBrandIcon(method.card.brand)}
                    <div>
                      <p className="font-medium capitalize">{method.card.brand} •••• {method.card.last4}</p>
                      <p className="text-sm text-gray-500">Expires {method.card.exp_month}/{method.card.exp_year}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePaymentMethod(method.id);
                    }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              onClick={handleAddPaymentMethod}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Another Payment Method
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}