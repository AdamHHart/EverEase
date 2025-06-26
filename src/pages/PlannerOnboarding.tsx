import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import ProgressTracker from '../components/emma/ProgressTracker';
import PlannerChatInterface from '../components/emma/PlannerChatInterface';
import WillBuilder from '../components/emma/WillBuilder';
import ExecutorSelector from '../components/emma/ExecutorSelector';
import PersonalNotesBuilder from '../components/emma/PersonalNotesBuilder';
import AssetDocumenter from '../components/emma/AssetDocumenter';
import DocumentOrganizer from '../components/emma/DocumentOrganizer';
import EmmaAvatar from '../components/emma/EmmaAvatar';
import { ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

interface OnboardingSession {
  id: string;
  current_step: number;
  conversation_history: any[];
  completed_steps: Record<string, any>;
  preferences: Record<string, any>;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome & Chat with Emma',
    description: 'Get to know Emma and understand the planning process',
    status: 'current' as const
  },
  {
    id: 'will',
    title: 'Your Will',
    description: 'Upload existing will or create a new one with Emma\'s help',
    status: 'upcoming' as const
  },
  {
    id: 'executors',
    title: 'Choose Executors',
    description: 'Select trusted people to carry out your wishes',
    status: 'upcoming' as const
  },
  {
    id: 'personal-notes',
    title: 'Personal Notes',
    description: 'Write heartfelt messages for your executors',
    status: 'upcoming' as const
  },
  {
    id: 'assets',
    title: 'Document Assets',
    description: 'Inventory your financial, physical, and digital assets',
    status: 'upcoming' as const
  },
  {
    id: 'documents',
    title: 'Organize Documents',
    description: 'Upload and categorize important documents',
    status: 'upcoming' as const
  }
];

export default function PlannerOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(ONBOARDING_STEPS);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadOrCreateSession();
  }, [user]);

  const loadOrCreateSession = async () => {
    if (!user) return;

    try {
      // Check for existing session
      const { data: existingSession } = await supabase
        .from('planner_onboarding_sessions')
        .select('*')
        .eq('planner_id', user.id)
        .single();

      if (existingSession) {
        setSession(existingSession);
        setCurrentStepIndex(existingSession.current_step - 1);
        updateStepsProgress(existingSession.current_step - 1, existingSession.completed_steps);
      } else {
        // Create new session
        const { data: newSession, error } = await supabase
          .from('planner_onboarding_sessions')
          .insert([
            {
              planner_id: user.id,
              current_step: 1,
              conversation_history: [],
              completed_steps: {},
              preferences: {}
            }
          ])
          .select()
          .single();

        if (error) throw error;
        setSession(newSession);
      }
    } catch (error) {
      console.error('Error loading onboarding session:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStepsProgress = (currentIndex: number, completedSteps: Record<string, any>) => {
    setSteps(prevSteps => 
      prevSteps.map((step, index) => ({
        ...step,
        status: index < currentIndex ? 'completed' : 
                index === currentIndex ? 'current' : 'upcoming'
      }))
    );
  };

  const handleStepComplete = async (stepId: string, data: any) => {
    if (!session) return;

    const nextStepIndex = currentStepIndex + 1;
    const updatedCompletedSteps = {
      ...session.completed_steps,
      [stepId]: { ...data, completedAt: new Date().toISOString() }
    };

    try {
      // Update session in database
      const { error } = await supabase
        .from('planner_onboarding_sessions')
        .update({
          current_step: nextStepIndex + 1,
          completed_steps: updatedCompletedSteps,
          last_active: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      // Update local state
      setSession({
        ...session,
        current_step: nextStepIndex + 1,
        completed_steps: updatedCompletedSteps
      });

      if (nextStepIndex < steps.length) {
        setCurrentStepIndex(nextStepIndex);
        updateStepsProgress(nextStepIndex, updatedCompletedSteps);
      } else {
        // Onboarding complete!
        await completeOnboarding();
      }
    } catch (error) {
      console.error('Error updating onboarding session:', error);
    }
  };

  const completeOnboarding = async () => {
    if (!session) return;

    try {
      // Mark session as completed
      await supabase
        .from('planner_onboarding_sessions')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('id', session.id);

      // Show completion message
      setCompletionMessage(`
        STOP EVERYTHING! 🛑 

        Do you realize what you just ACCOMPLISHED?! 🎉🎉🎉

        ✅ Will: DONE
        ✅ Executors: SET UP  
        ✅ Personal Notes: WRITTEN
        ✅ Assets: DOCUMENTED
        ✅ Documents: ORGANIZED

        You just gave your family the most incredible gift - complete peace of mind! They're going to be so grateful that you took the time to organize everything perfectly.

        Most people never do this. But YOU? You're a CHAMPION for your loved ones! 🏆

        Your plan is now live and secure. I'll be here to help your executors when the time comes, and I'll make sure they feel just as supported as you did today.

        You should feel incredibly proud right now. You've just taken care of your family in the most beautiful way possible! 💝
      `);

      // After 10 seconds, navigate to main dashboard
      setTimeout(() => {
        navigate('/my-plan');
      }, 10000);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      updateStepsProgress(prevIndex, session?.completed_steps || {});
    }
  };

  const exitOnboarding = () => {
    navigate('/my-plan');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white flex items-center justify-center">
        <div className="animate-pulse h-8 w-8 rounded-full bg-calm-400"></div>
      </div>
    );
  }

  if (completionMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <EmmaAvatar size="lg" mood="celebrating" className="mx-auto mb-4" />
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-green-700 mb-4">Plan Complete! 🎉</h1>
            </div>
            <div className="whitespace-pre-line text-lg">
              {completionMessage}
            </div>
            <div className="mt-8 text-center">
              <Button 
                onClick={() => navigate('/my-plan')}
                className="bg-calm-500 hover:bg-calm-600"
              >
                Go to My Plan Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={exitOnboarding}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Exit to Dashboard
            </Button>
            <div className="flex items-center gap-3">
              <EmmaAvatar size="md" mood="celebrating" />
              <div>
                <h1 className="text-2xl font-bold">Planning with Emma</h1>
                <p className="text-gray-600">Let's create your amazing end-of-life plan together!</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Sparkles className="h-4 w-4" />
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Progress Sidebar */}
          <div className="lg:col-span-1">
            <ProgressTracker 
              steps={steps}
              currentStepId={currentStep.id}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="min-h-[600px]">
              <CardContent className="p-6">
                {currentStep.id === 'welcome' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <EmmaAvatar size="lg" mood="celebrating" className="mx-auto mb-4" />
                      <h2 className="text-2xl font-bold mb-2">Welcome to Your Planning Journey! 🎉</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">
                        I'm Emma, your personal planning assistant! I'm here to make this process as smooth 
                        and supportive as possible. Let's chat about what we're going to accomplish together!
                      </p>
                    </div>
                    
                    <PlannerChatInterface
                      onStepComplete={handleStepComplete}
                      currentStep={currentStep.id}
                      context={{ stepIndex: currentStepIndex, totalSteps: steps.length }}
                    />
                  </div>
                )}

                {currentStep.id === 'will' && (
                  <WillBuilder
                    onComplete={(data) => handleStepComplete('will', data)}
                    onBack={currentStepIndex > 0 ? goBack : undefined}
                  />
                )}

                {currentStep.id === 'executors' && (
                  <ExecutorSelector
                    onComplete={(data) => handleStepComplete('executors', data)}
                    onBack={currentStepIndex > 0 ? goBack : undefined}
                  />
                )}

                {currentStep.id === 'personal-notes' && (
                  <PersonalNotesBuilder
                    onComplete={(data) => handleStepComplete('personal-notes', data)}
                    onBack={currentStepIndex > 0 ? goBack : undefined}
                    executors={session?.completed_steps?.executors}
                  />
                )}

                {currentStep.id === 'assets' && (
                  <AssetDocumenter
                    onComplete={(data) => handleStepComplete('assets', data)}
                    onBack={currentStepIndex > 0 ? goBack : undefined}
                  />
                )}

                {currentStep.id === 'documents' && (
                  <DocumentOrganizer
                    onComplete={(data) => handleStepComplete('documents', data)}
                    onBack={currentStepIndex > 0 ? goBack : undefined}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}