import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, Calendar, User, Info } from 'lucide-react';
import { toast } from '../ui/toast';

interface DeathNotificationProps {
  executorId: string;
  plannerId: string;
  plannerName: string;
  onVerificationComplete: () => void;
}

export default function DeathNotification({ 
  executorId, 
  plannerId, 
  plannerName, 
  onVerificationComplete 
}: DeathNotificationProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfDeath: '',
    placeOfDeath: '',
    relationship: '',
    additionalInfo: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create trigger event for death notification
      const { error: triggerError } = await supabase
        .from('trigger_events')
        .insert([
          {
            user_id: plannerId,
            executor_id: executorId,
            type: 'death',
            verification_method: 'manual',
            verification_details: `Reported by ${user?.email} on ${new Date().toISOString()}. Date of death: ${formData.dateOfDeath}`,
            triggered: false // Will be set to true after death certificate upload
          }
        ]);

      if (triggerError) throw triggerError;

      // Log the notification
      await supabase.from('activity_log').insert([
        {
          user_id: plannerId,
          action_type: 'death_reported',
          details: `Death reported by executor ${user?.email}`,
        }
      ]);

      toast({
        title: "Notification Received",
        description: "Thank you for this notification. The next step will be to upload a death certificate for verification.",
      });

      onVerificationComplete();
    } catch (error) {
      console.error('Error submitting death notification:', error);
      toast({
        title: "Error",
        description: "There was a problem submitting this notification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          Report Passing of {plannerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-amber-900 mb-2">Important Information</h3>
          <p className="text-sm text-amber-800 mb-3">
            We understand this is a difficult time. This form allows you to notify us of {plannerName}'s passing, 
            which will begin the process of providing you access to their end-of-life planning documents.
          </p>
          <div className="flex items-start gap-2 text-sm text-amber-800">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              After submitting this form, you'll need to upload a death certificate for verification. 
              This is a security measure to protect {plannerName}'s privacy and ensure their wishes are followed.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date of Passing
              </label>
              <Input
                type="date"
                required
                value={formData.dateOfDeath}
                onChange={(e) => setFormData({ ...formData, dateOfDeath: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Place of Passing</label>
              <Input
                value={formData.placeOfDeath}
                onChange={(e) => setFormData({ ...formData, placeOfDeath: e.target.value })}
                placeholder="e.g., Hospital, Home, etc."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              <User className="h-4 w-4 inline mr-1" />
              Your Relationship to {plannerName}
            </label>
            <Input
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Spouse, Child, Sibling, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Additional Information</label>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 min-h-[100px]"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Any additional details you'd like to share"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={loading || !formData.dateOfDeath}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          {loading ? 'Submitting...' : 'Submit Notification'}
        </Button>
      </CardFooter>
    </Card>
  );
}