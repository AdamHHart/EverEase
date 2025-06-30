import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Mail, Shield, AlertCircle, CreditCard } from 'lucide-react';
import AuditTrail from '../components/AuditTrail';
import SubscriptionStatus from '../components/SubscriptionStatus';
import { toast } from '../components/ui/toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';

export default function ProfilePage() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState({
    email: user?.email || '',
    role: userRole || '',
  });
  const [isPasswordResetModalOpen, setIsPasswordResetModalOpen] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState(user?.email || '');
  const [sendingPasswordReset, setSendingPasswordReset] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user?.id);

      if (error) throw error;
      setSuccessMessage('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSendPasswordReset = async () => {
    setSendingPasswordReset(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase is not properly configured. Please check your environment variables.');
      }

      // First, use Supabase's built-in password reset
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(passwordResetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) throw resetError;

      // Then, send a custom email through our function
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: passwordResetEmail,
            resetUrl: `${window.location.origin}/auth/reset-password`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.warn('Custom password reset email failed, but Supabase default email was sent:', errorData);
          // Don't throw here, as the Supabase default email was still sent
        }
      } catch (emailError) {
        console.warn('Failed to send custom password reset email, but Supabase default email was sent:', emailError);
        // Don't throw here, as the Supabase default email was still sent
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for password reset instructions. The link will expire in 1 hour.",
      });
      
      setIsPasswordResetModalOpen(false);
    } catch (error: any) {
      console.error('Error sending password reset:', error);
      setError(error.message || 'Failed to send password reset email');
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingPasswordReset(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-calm-500" />
              Account Information
            </CardTitle>
            <CardDescription>
              Manage your account settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{profile.email}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Account Role
              </label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-400" />
                <span className="capitalize text-gray-600">{profile.role}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <SubscriptionStatus />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-calm-500" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setIsPasswordResetModalOpen(true)}
            >
              Change Password
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {/* Implement 2FA setup */}}
            >
              Enable Two-Factor Authentication
            </Button>
          </CardContent>
        </Card>

        <AuditTrail />

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-600">
            <Shield className="h-5 w-5" />
            {successMessage}
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      <Dialog open={isPasswordResetModalOpen} onOpenChange={setIsPasswordResetModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={passwordResetEmail}
                onChange={(e) => setPasswordResetEmail(e.target.value)}
                placeholder="Enter your email address"
              />
              <p className="text-sm text-gray-500">
                We'll send a password reset link to this email address.
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPasswordResetModalOpen(false)}
              disabled={sendingPasswordReset}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendPasswordReset}
              disabled={sendingPasswordReset || !passwordResetEmail}
            >
              {sendingPasswordReset ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}