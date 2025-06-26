import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EmmaAvatar from '../components/emma/EmmaAvatar';
import ExecutorChatInterface from '../components/emma/ExecutorChatInterface';
import OnboardingSteps from '../components/emma/OnboardingSteps';
import DeathNotification from '../components/emma/DeathNotification';
import DocumentScanner from '../components/DocumentScanner';
import AssetReview from '../components/emma/AssetReview';
import ContactOutreach from '../components/emma/ContactOutreach';
import SessionResume from '../components/emma/SessionResume';
import { toast } from '../components/ui/toast';

interface OnboardingSession {
  id: string;
  executor_id: string;
  planner_id: string;
  trigger_type: 'invitation' | 'death_notification';
  current_step: number;
  conversation_history: any[];
  completed_steps: Record<string, any>;
  completed_tasks: any[];
  next_priority_tasks: any[];
  death_verified: boolean;
  death_certificate_uploaded: boolean;
  last_session_summary: string;
  session_count: number;
  last_accessed_at: string;
}

interface PlannerProfile {
  id: string;
  name: string;
  assets: any[];
  documents: any[];
  wishes: any[];
  contacts: any[];
}

const ONBOARDING_STEPS = [
  {
    id: 'notification',
    title: 'Death Notification',
    description: 'Report the passing and verify your identity',
    status: 'current' as const
  },
  {
    id: 'verification',
    title: 'Document Verification',
    description: 'Upload death certificate for verification',
    status: 'upcoming' as const
  },
  {
    id: 'will',
    title: 'Will Review',
    description: 'Review the will and final wishes',
    status: 'upcoming' as const
  },
  {
    id: 'assets',
    title: 'Asset Review',
    description: 'Review assets and their details',
    status: 'upcoming' as const
  },
  {
    id: 'documents',
    title: 'Document Access',
    description: 'Access important documents',
    status: 'upcoming' as const
  },
  {
    id: 'contacts',
    title: 'Contact Outreach',
    description: 'Notify relevant organizations',
    status: 'upcoming' as const
  }
];

export default function ExecutorOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [plannerProfile, setPlannerProfile] = useState<PlannerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [steps, setSteps] = useState(ONBOARDING_STEPS);
  const [showScanner, setShowScanner] = useState(false);
  const [isReturningSession, setIsReturningSession] = useState(false);

  useEffect(() => {
    loadOrCreateSession();
  }, [user]);

  const loadOrCreateSession = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get executor information
      const { data: executorData } = await supabase
        .from('executors')
        .select(`
          id,
          name,
          planner_id,
          status
        `)
        .eq('email', user.email)
        .eq('status', 'active')
        .single();

      if (!executorData) {
        // Not an executor or not active
        navigate('/dashboard');
        return;
      }

      // Check for existing session
      const { data: existingSession } = await supabase
        .from('executor_onboarding_sessions')
        .select('*')
        .eq('executor_id', executorData.id)
        .single();

      // Get planner's name
      let plannerName = `Planner ${executorData.planner_id.slice(0, 8)}`;
      try {
        const { data: plannerData } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', executorData.planner_id)
          .single();
          
        if (plannerData) {
          // Try to get a more friendly name from auth.users
          const { data: userData } = await supabase.auth.admin.getUserById(executorData.planner_id);
          if (userData?.user?.email) {
            plannerName = userData.user.email.split('@')[0];
          }
        }
      } catch (error) {
        console.error('Error fetching planner name:', error);
      }

      // Fetch actual assets, documents, etc.
      const [
        { data: assetsData },
        { data: documentsData },
        { data: wishesData }
      ] = await Promise.all([
        supabase.from('assets').select('*').eq('user_id', executorData.planner_id),
        supabase.from('documents').select('*').eq('user_id', executorData.planner_id),
        supabase.from('wishes').select('*').eq('user_id', executorData.planner_id)
      ]);

      // Generate contacts from assets and documents
      const contacts: any[] = [];
      const contactMap = new Map();

      // Process documents
      documentsData?.forEach(doc => {
        if (doc.contact_email) {
          const key = `${doc.contact_email}-${doc.category}`;
          if (!contactMap.has(key)) {
            contactMap.set(key, {
              id: key,
              name: doc.contact_name || 'Unknown',
              organization: doc.contact_organization || '',
              email: doc.contact_email,
              phone: doc.contact_phone || '',
              type: doc.category.charAt(0).toUpperCase() + doc.category.slice(1),
              category: doc.category,
              status: 'not_contacted'
            });
            contacts.push(contactMap.get(key));
          }
        }
      });

      // Process assets
      assetsData?.forEach(asset => {
        if (asset.contact_email) {
          const key = `${asset.contact_email}-${asset.type}`;
          if (!contactMap.has(key)) {
            contactMap.set(key, {
              id: key,
              name: asset.contact_name || 'Unknown',
              organization: asset.contact_organization || '',
              email: asset.contact_email,
              phone: asset.contact_phone || '',
              type: asset.type.charAt(0).toUpperCase() + asset.type.slice(1),
              category: asset.type,
              status: 'not_contacted'
            });
            contacts.push(contactMap.get(key));
          }
        }
      });

      const plannerProfileData: PlannerProfile = {
        id: executorData.planner_id,
        name: plannerName,
        assets: assetsData || [],
        documents: documentsData || [],
        wishes: wishesData || [],
        contacts: contacts
      };
      
      setPlannerProfile(plannerProfileData);

      if (existingSession) {
        // Returning user with existing session
        setSession(existingSession);
        
        // Update steps based on completed steps
        if (existingSession.completed_steps) {
          const completedStepIds = Object.keys(existingSession.completed_steps);
          const updatedSteps = steps.map((step, index) => ({
            ...step,
            status: completedStepIds.includes(step.id) 
              ? 'completed' 
              : index === existingSession.current_step - 1 
                ? 'current' 
                : 'upcoming'
          }));
          setSteps(updatedSteps);
        }
        
        setCurrentStepIndex(existingSession.current_step - 1);
        
        // If they've been here before, show the session resume screen
        if (existingSession.session_count > 1) {
          setIsReturningSession(true);
        }
        
        // Update session count and last accessed
        await supabase
          .from('executor_onboarding_sessions')
          .update({
            session_count: existingSession.session_count + 1,
            last_accessed_at: new Date().toISOString()
          })
          .eq('id', existingSession.id);
      } else {
        // Check if death has been verified
        const { data: triggerData } = await supabase
          .from('trigger_events')
          .select('triggered')
          .eq('user_id', executorData.planner_id)
          .eq('executor_id', executorData.id)
          .eq('type', 'death')
          .single();
          
        const deathVerified = !!triggerData?.triggered;
        
        // Create new session
        const { data: newSession, error } = await supabase
          .from('executor_onboarding_sessions')
          .insert([
            {
              executor_id: executorData.id,
              planner_id: executorData.planner_id,
              trigger_type: 'death_notification',
              current_step: deathVerified ? 2 : 1, // Skip to verification if death already reported
              conversation_history: [],
              completed_steps: deathVerified ? {
                notification: {
                  completed: true,
                  completedAt: new Date().toISOString()
                }
              } : {},
              completed_tasks: [],
              next_priority_tasks: [],
              death_verified: deathVerified,
              death_certificate_uploaded: false,
              session_count: 1,
              last_accessed_at: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (error) throw error;
        
        setSession(newSession);
        
        // If death is already verified, update steps and current step
        if (deathVerified) {
          const updatedSteps = [...steps];
          updatedSteps[0].status = 'completed';
          updatedSteps[1].status = 'current';
          setSteps(updatedSteps);
          setCurrentStepIndex(1); // Move to verification step
        }
      }
    } catch (error) {
      console.error('Error loading executor onboarding session:', error);
      toast({
        title: "Error",
        description: "Failed to load your session. Please try again.",
        variant: "destructive"
      });
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
        .from('executor_onboarding_sessions')
        .update({
          current_step: nextStepIndex + 1,
          completed_steps: updatedCompletedSteps,
          last_accessed_at: new Date().toISOString()
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
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive"
      });
    }
  };

  const completeOnboarding = async () => {
    if (!session) return;

    try {
      // Generate a summary of completed tasks
      const summary = `You've completed the executor onboarding process. You've verified the death, uploaded the death certificate, reviewed the will and assets, and contacted the necessary organizations.`;
      
      // Update session with completion summary
      await supabase
        .from('executor_onboarding_sessions')
        .update({
          last_session_summary: summary
        })
        .eq('id', session.id);

      // Navigate to executor dashboard
      navigate('/executor-dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete the onboarding process. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleContinueSession = () => {
    setIsReturningSession(false);
  };

  const handleCapture = (imageData: string) => {
    // In a real implementation, this would upload the death certificate
    setShowScanner(false);
    
    // Simulate successful upload and verification
    setTimeout(() => {
      handleStepComplete('verification', { 
        deathCertificateUploaded: true,
        verificationMethod: 'document_upload'
      });
    }, 1500);
  };

  const handleDeathNotificationComplete = () => {
    handleStepComplete('notification', { 
      deathReported: true,
      reportedAt: new Date().toISOString()
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white flex items-center justify-center">
        <div className="animate-pulse h-8 w-8 rounded-full bg-calm-400"></div>
      </div>
    );
  }

  // Show session resume screen for returning users
  if (isReturningSession && session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <SessionResume
            executorName={user?.email?.split('@')[0] || 'Executor'}
            plannerName={plannerProfile?.name || 'Planner'}
            lastSessionSummary={session.last_session_summary}
            completedSteps={Object.keys(session.completed_steps).map(key => {
              switch(key) {
                case 'notification': return 'Reported the passing';
                case 'verification': return 'Uploaded death certificate';
                case 'will': return 'Reviewed the will';
                case 'assets': return 'Reviewed assets';
                case 'documents': return 'Accessed important documents';
                case 'contacts': return 'Notified relevant organizations';
                default: return key;
              }
            })}
            currentStep={steps[currentStepIndex].title}
            onContinue={handleContinueSession}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {showScanner && (
        <DocumentScanner
          onCapture={handleCapture}
          onClose={() => setShowScanner(false)}
        />
      )}
      
      <div className="min-h-screen bg-gradient-to-b from-calm-50 to-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/executor-dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-3">
                <EmmaAvatar size="md" mood="encouraging" />
                <div>
                  <h1 className="text-2xl font-bold">Executor Process</h1>
                  <p className="text-gray-600">
                    {plannerProfile?.name || 'Planner'}'s end-of-life plan
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <div className="lg:col-span-1">
              <OnboardingSteps 
                steps={steps}
                currentStepId={steps[currentStepIndex].id}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="min-h-[600px]">
                <CardContent className="p-6">
                  {steps[currentStepIndex].id === 'notification' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <EmmaAvatar size="lg" mood="encouraging" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">I'm here to help you through this difficult time</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          I understand this is a challenging moment. I'll guide you through each step of managing {plannerProfile?.name}'s affairs with care and support.
                        </p>
                      </div>
                      
                      <DeathNotification
                        executorId={session?.executor_id || ''}
                        plannerId={session?.planner_id || ''}
                        plannerName={plannerProfile?.name || 'Planner'}
                        onVerificationComplete={handleDeathNotificationComplete}
                      />
                      
                      <ExecutorChatInterface
                        mode="onboarding"
                        executorName={user?.email?.split('@')[0] || 'Executor'}
                        plannerName={plannerProfile?.name || 'Planner'}
                        currentStep="notification"
                        context={{
                          step: 'notification',
                          plannerName: plannerProfile?.name
                        }}
                      />
                    </div>
                  )}

                  {steps[currentStepIndex].id === 'verification' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <EmmaAvatar size="lg" mood="encouraging" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Death Certificate Verification</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          To proceed with accessing {plannerProfile?.name}'s documents and information, we need to verify the death certificate. This helps ensure the security and privacy of their information.
                        </p>
                      </div>
                      
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                        <h3 className="font-medium text-amber-900 mb-4">Please upload the death certificate</h3>
                        <div className="flex justify-center gap-4">
                          <Button
                            onClick={() => setShowScanner(true)}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            Scan Document
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              // Simulate file upload
                              handleStepComplete('verification', { 
                                deathCertificateUploaded: true,
                                verificationMethod: 'document_upload'
                              });
                            }}
                          >
                            Upload File
                          </Button>
                        </div>
                      </div>
                      
                      <ExecutorChatInterface
                        mode="onboarding"
                        executorName={user?.email?.split('@')[0] || 'Executor'}
                        plannerName={plannerProfile?.name || 'Planner'}
                        currentStep="verification"
                        context={{
                          step: 'verification',
                          plannerName: plannerProfile?.name
                        }}
                      />
                    </div>
                  )}

                  {steps[currentStepIndex].id === 'will' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <EmmaAvatar size="lg" mood="encouraging" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Will Review</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          Here is {plannerProfile?.name}'s will and final wishes. Take your time to review this important document.
                        </p>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="font-medium mb-4">Last Will and Testament</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <p className="text-gray-700 whitespace-pre-line">
                            {plannerProfile?.wishes[0]?.content || 
                              `This is the last will and testament of ${plannerProfile?.name}. 
                              
                              I hereby designate [Executor Name] as the executor of my estate.
                              
                              I direct that all my just debts and funeral expenses be paid as soon as practicable after my death.
                              
                              I give, devise, and bequeath all of my property, both real and personal, of whatever kind and wherever situated, to my beneficiaries as outlined in the attached documents.`
                            }
                          </p>
                        </div>
                        <Button
                          onClick={() => handleStepComplete('will', { 
                            willReviewed: true,
                            reviewedAt: new Date().toISOString()
                          })}
                        >
                          Continue to Next Step
                        </Button>
                      </div>
                      
                      <ExecutorChatInterface
                        mode="onboarding"
                        executorName={user?.email?.split('@')[0] || 'Executor'}
                        plannerName={plannerProfile?.name || 'Planner'}
                        currentStep="will"
                        context={{
                          step: 'will',
                          plannerName: plannerProfile?.name
                        }}
                      />
                    </div>
                  )}

                  {steps[currentStepIndex].id === 'assets' && plannerProfile && (
                    <AssetReview
                      assets={plannerProfile.assets}
                      plannerName={plannerProfile.name}
                      onComplete={() => handleStepComplete('assets', { 
                        assetsReviewed: true,
                        reviewedAt: new Date().toISOString()
                      })}
                    />
                  )}

                  {steps[currentStepIndex].id === 'documents' && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <EmmaAvatar size="lg" mood="encouraging" className="mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Important Documents</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                          Here are the important documents that {plannerProfile?.name} has organized for you.
                        </p>
                      </div>
                      
                      <div className="bg-white border rounded-lg p-6">
                        <h3 className="font-medium mb-4">Document Access</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {plannerProfile?.documents.map(doc => (
                            <div key={doc.id} className="border rounded-lg p-4">
                              <h4 className="font-medium">{doc.name}</h4>
                              <p className="text-sm text-gray-500 capitalize mb-2">{doc.category}</p>
                              {doc.description && (
                                <p className="text-sm text-gray-600 mb-2">{doc.description}</p>
                              )}
                              <Button variant="outline" size="sm">
                                View Document
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => handleStepComplete('documents', { 
                            documentsReviewed: true,
                            reviewedAt: new Date().toISOString()
                          })}
                        >
                          Continue to Next Step
                        </Button>
                      </div>
                      
                      <ExecutorChatInterface
                        mode="onboarding"
                        executorName={user?.email?.split('@')[0] || 'Executor'}
                        plannerName={plannerProfile?.name || 'Planner'}
                        currentStep="documents"
                        context={{
                          step: 'documents',
                          plannerName: plannerProfile?.name
                        }}
                      />
                    </div>
                  )}

                  {steps[currentStepIndex].id === 'contacts' && plannerProfile && (
                    <ContactOutreach
                      contacts={plannerProfile.contacts}
                      plannerName={plannerProfile.name}
                      onComplete={() => handleStepComplete('contacts', { 
                        contactsNotified: true,
                        notifiedAt: new Date().toISOString()
                      })}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}