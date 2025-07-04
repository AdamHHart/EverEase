import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

// Components
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import MyPlanDashboard from './pages/MyPlanDashboard';
import ExecutorDashboard from './pages/ExecutorDashboard';
import OnboardingPage from './pages/OnboardingPage';
import PlannerOnboarding from './pages/PlannerOnboarding';
import ChecklistPage from './pages/ChecklistPage';
import AssetsPage from './pages/AssetsPage';
import DocumentsPage from './pages/DocumentsPage';
import WishesPage from './pages/WishesPage';
import ExecutorsPage from './pages/ExecutorsPage';
import ProfilePage from './pages/ProfilePage';
import LegalPage from './pages/LegalPage';
import EmailTestPage from './pages/EmailTestPage';
import ExecutorAcceptPage from './pages/ExecutorAcceptPage';
import ExecutorInvitation from './pages/ExecutorInvitation';
import ExecutorOnboarding from './pages/ExecutorOnboarding';
import HelpPage from './pages/HelpPage';
import NotFoundPage from './pages/NotFoundPage';
import LandingPage from './pages/LandingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';

// Auth provider
import { AuthProvider } from './contexts/AuthContext';

// Toast system
import { Toaster } from './components/ui/toast';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse h-12 w-12 rounded-full bg-calm-400"></div>
          <p className="text-muted-foreground">Loading Ever Ease...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider session={session}>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Public routes - these don't require authentication */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route path="/executor/accept/:token" element={<ExecutorAcceptPage />} />
        <Route path="/executor/invitation/:token" element={<ExecutorInvitation />} />
        <Route path="/email-test" element={<EmailTestPage />} />
        
        {/* Payment success and cancel routes */}
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/payment/cancel" element={<PaymentCancelPage />} />
        
        {/* Payment route - accessible with or without auth */}
        <Route path="/payment" element={<PaymentPage />} />
        
        {/* Protected routes - these require authentication */}
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-plan" element={<MyPlanDashboard />} />
          <Route path="executor-dashboard" element={<ExecutorDashboard />} />
          <Route path="executor-onboarding" element={<ExecutorOnboarding />} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="planner-onboarding" element={<PlannerOnboarding />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="assets" element={<AssetsPage />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="wishes" element={<WishesPage />} />
          <Route path="executors" element={<ExecutorsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="legal" element={<LegalPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;