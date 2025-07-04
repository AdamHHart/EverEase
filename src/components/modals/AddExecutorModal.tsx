import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/toast';

interface AddExecutorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddExecutorModal({ open, onOpenChange, onSuccess }: AddExecutorModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if Supabase is properly configured
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      // Create executor record
      const { data: executor, error: executorError } = await supabase
        .from('executors')
        .insert([
          {
            planner_id: user?.id,
            name: formData.name,
            email: formData.email,
            relationship: formData.relationship,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (executorError) {
        console.error('Error creating executor:', executorError);
        throw executorError;
      }

      console.log('Executor created:', executor);

      // Create trigger event for this executor
      const { error: triggerError } = await supabase
        .from('trigger_events')
        .insert([
          {
            user_id: user?.id,
            type: 'death',
            verification_method: 'professional',
            executor_id: executor.id
          }
        ]);

      if (triggerError) {
        console.error('Error creating trigger event:', triggerError);
        throw triggerError;
      }

      // Get planner's name for the invitation
      const plannerName = user?.email?.split('@')[0] || 'Someone';

      console.log('Sending invitation email...');

      // Send invitation email through edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-executor-invitation`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          executorId: executor.id,
          email: formData.email,
          name: formData.name,
          plannerName: plannerName
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Email sending failed:', errorData);
        
        // If the email is the user's own email, we can still proceed
        if (formData.email === user?.email) {
          toast({
            title: "Executor added successfully! ✅",
            description: `Since you invited yourself, no email was sent. You can access executor functions from your dashboard.`,
          });
          
          // Reset form and close modal
          setFormData({
            name: '',
            email: '',
            relationship: '',
          });
          
          onSuccess();
          onOpenChange(false);
          return;
        }
        
        // Check if it's a Resend validation error
        if (errorData.includes("You can only send to verified emails") || 
            errorData.includes("domain not verified") ||
            errorData.includes("Unsupported email service")) {
          throw new Error("Email could not be sent due to domain verification restrictions. The executor was added, but you'll need to share the invitation link manually.");
        }
        
        throw new Error(`Failed to send invitation email: ${errorData}`);
      }

      const responseData = await response.json();
      console.log('Email response:', responseData);

      if (!responseData.success) {
        throw new Error(responseData.error || 'Failed to send invitation email');
      }

      // Check if the email is the user's own email
      if (formData.email === user?.email) {
        toast({
          title: "Executor added successfully! ✅",
          description: `Since you invited yourself, no email was sent. You can access executor functions from your dashboard.`,
        });
      } else {
        toast({
          title: "Executor invited successfully! ✅",
          description: `An invitation email has been sent to ${formData.name} at ${formData.email}. They have 7 days to accept the invitation.`,
        });
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        relationship: '',
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding executor:', error);
      
      // Check if it's a Resend validation error about sending to non-verified domains
      if (error.message && (
          error.message.includes("domain verification") || 
          error.message.includes("verified emails") ||
          error.message.includes("Unsupported email service"))) {
        toast({
          title: "Executor added, but email not sent",
          description: "The executor was added successfully, but we couldn't send an email invitation due to domain verification restrictions. Please share the invitation link manually.",
          variant: "destructive",
        });
        
        // Still consider this a success since the executor was created
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: "Error sending invitation",
          description: error.message || "Failed to invite executor. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Executor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter executor's full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email Address *</label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter executor's email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Relationship</label>
            <Input
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="e.g., Family member, Attorney, Friend"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📧 What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• An invitation email will be sent to {formData.email || 'the executor'}</li>
              <li>• They'll have 7 days to accept the invitation</li>
              <li>• Once accepted, they'll have access to your planning documents</li>
              <li>• You can revoke access at any time</li>
            </ul>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.email}>
              {loading ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}