import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Lock, Mail, ShieldCheck, ArrowLeft, AlertCircle, Settings } from 'lucide-react';
import { toast } from '../components/ui/toast';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }

    // Check if mode is specified in URL query params
    const params = new URLSearchParams(location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'signup' || modeParam === 'reset') {
      setMode(modeParam);
    }
  }, [user, navigate, location]);

  // Check if Supabase is configured
  const supabaseConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check configuration before attempting auth
    if (!supabaseConfigured) {
      setError('Supabase is not properly configured. Please check your environment variables and restart the development server.');
      toast({
        title: "Configuration Error",
        description: "Please configure your Supabase credentials in the .env file and restart the server.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
      } else if (mode === 'signup') {
        const { error: signUpError, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: {
              role: 'planner',
            },
          },
        });
        
        if (signUpError) {
          // Handle specific "User already registered" error
          if (signUpError.message?.includes('User already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
            setMode('signin');
            return;
          }
          // Re-throw other signup errors to be handled by the general catch block
          throw signUpError;
        }
        
        if (data.user) {
          // Send welcome email
          try {
            await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-welcome-email`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email,
                name: email.split('@')[0], // Use email prefix as name
              }),
            });
          } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the signup if email fails
          }

          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account. We've also sent you a welcome email with next steps.",
          });
          setMode('signin');
        }
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });

        if (error) throw error;

        // Send custom password reset email
        try {
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              resetUrl: `${window.location.origin}/auth/reset-password`,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send custom password reset email:', emailError);
          // Don't fail if custom email fails, Supabase still sends default
        }

        toast({
          title: "Password reset email sent",
          description: "Please check your email for password reset instructions. The link will expire in 1 hour.",
        });
        setMode('signin');
      }
    } catch (error: any) {
      let errorMessage = error.message || 'An error occurred';
      
      // Provide more user-friendly error messages
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and click the confirmation link before signing in.';
      } else if (error.message?.includes('Failed to fetch') || error.message?.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show configuration warning if Supabase is not configured
  if (!supabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-calm-300 to-background flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="w-full shadow-lg border-none">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-6 w-6 text-amber-500" />
                <CardTitle className="text-amber-700">Configuration Required</CardTitle>
              </div>
              <CardDescription>
                Supabase credentials need to be configured to use this application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Setup Instructions:</h3>
                <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">supabase.com/dashboard</a></li>
                  <li>Select your project (or create one)</li>
                  <li>Go to Settings → API</li>
                  <li>Copy your Project URL and anon/public key</li>
                  <li>Update your .env file with the actual values</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
              <div className="text-xs text-muted-foreground">
                <p>Check the browser console for detailed configuration instructions.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-300 to-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center">
              <ShieldCheck className="h-16 w-16 text-calm-600" />
              <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer" className="ml-2">
                <img 
                  src="/bolt_badge.png" 
                  alt="Powered by Bolt.new" 
                  className="h-8 w-8"
                />
              </a>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Ever Ease</h1>
          <p className="text-muted-foreground">
            Secure end-of-life planning made simple
          </p>
        </div>
        
        <Card className="w-full shadow-lg border-none">
          <CardHeader>
            <CardTitle>
              {mode === 'signin' ? 'Sign in to your account' : 
               mode === 'signup' ? 'Create an account' : 
               'Reset your password'}
            </CardTitle>
            <CardDescription>
              {mode === 'signin' 
                ? 'Enter your email and password to access your secure vault'
                : mode === 'signup'
                ? 'Sign up to start planning and organizing your important information'
                : 'Enter your email to receive password reset instructions'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                  {mode === 'signup' && (
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  )}
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full bg-calm-500 hover:bg-calm-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'signin' ? 'Signing in...' : 
                     mode === 'signup' ? 'Creating account...' :
                     'Sending reset instructions...'}
                  </span>
                ) : (
                  <>{mode === 'signin' ? 'Sign in' : 
                     mode === 'signup' ? 'Create account' :
                     'Send reset instructions'}</>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-sm text-center text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-calm-600 hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : mode === 'signup' ? (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="text-calm-600 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="text-calm-600 hover:underline font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </button>
              )}
            </div>
            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError(null);
                }}
                className="text-sm text-calm-600 hover:underline font-medium"
              >
                Forgot your password?
              </button>
            )}
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Ever Ease secures your data with end-to-end encryption</p>
          <div className="flex justify-center mt-2">
            <a href="https://bolt.new/" target="_blank" rel="noopener noreferrer">
              <img 
                src="/bolt_badge.png" 
                alt="Powered by Bolt.new" 
                className="h-6 w-6"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}