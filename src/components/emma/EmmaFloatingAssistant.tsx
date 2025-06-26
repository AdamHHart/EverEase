import { useState, useEffect } from 'react';
import { X, MessageCircle, Minimize2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import EmmaAvatar from './EmmaAvatar';
import PlannerChatInterface from './PlannerChatInterface';
import ExecutorChatInterface from './ExecutorChatInterface';
import { cn } from '../../lib/utils';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface EmmaFloatingAssistantProps {
  className?: string;
}

export default function EmmaFloatingAssistant({ className }: EmmaFloatingAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMode, setChatMode] = useState<'planner' | 'executor'>('planner');
  const location = useLocation();
  const { userRole } = useAuth();

  // Determine if we're on the executor dashboard
  const isExecutorContext = location.pathname.includes('executor-dashboard') || 
                           location.pathname.includes('executor-onboarding');

  // Auto-show the assistant after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000); // Show after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Listen for toggle events from Header and Sidebar
  useEffect(() => {
    const handleToggleEmmaChat = () => {
      if (!isVisible) {
        setIsVisible(true);
        setIsMinimized(false);
        setIsExpanded(true);
      } else if (isMinimized) {
        setIsMinimized(false);
        setIsExpanded(true);
      } else if (!isExpanded) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };

    window.addEventListener('toggleEmmaChat', handleToggleEmmaChat);
    
    return () => {
      window.removeEventListener('toggleEmmaChat', handleToggleEmmaChat);
    };
  }, [isVisible, isExpanded, isMinimized]);

  // Set initial chat mode based on context
  useEffect(() => {
    if (isExecutorContext) {
      setChatMode('executor');
    } else {
      setChatMode('planner');
    }
  }, [isExecutorContext]);

  // Don't render if not visible
  if (!isVisible) return null;

  // Minimized state - just the floating icon
  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-6 right-6 z-50", className)}>
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-16 w-16 rounded-full bg-calm-500 hover:bg-calm-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <EmmaAvatar size="sm" mood="celebrating" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      {/* Floating Icon - collapsed state */}
      {!isExpanded && (
        <div className="relative">
          <Button
            onClick={() => setIsExpanded(true)}
            className="h-16 w-16 rounded-full bg-calm-500 hover:bg-calm-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="h-6 w-6 text-white" />
          </Button>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gray-500 hover:bg-gray-600 text-white"
          >
            <X className="h-3 w-3" />
          </Button>

          {/* Notification bubble */}
          <div className="absolute -top-1 -left-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">!</span>
          </div>

          {/* Welcome tooltip */}
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-3 max-w-xs border border-calm-200">
            <div className="flex items-center gap-2 mb-2">
              <EmmaAvatar size="sm" mood="celebrating" />
              <span className="font-medium text-calm-900">Hi! I'm Emma!</span>
            </div>
            <p className="text-sm text-gray-600">
              I'm here to help you with your planning journey. Click to chat with me! 💬
            </p>
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-calm-200"></div>
          </div>
        </div>
      )}

      {/* Expanded Chat Interface */}
      {isExpanded && (
        <Card className="w-96 h-[500px] shadow-xl border-calm-200">
          <CardHeader className="pb-3 bg-gradient-to-r from-calm-100 to-calm-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <EmmaAvatar size="md" mood="celebrating" />
                <div>
                  <CardTitle className="text-lg">Emma</CardTitle>
                  <p className="text-sm text-calm-700">
                    {chatMode === 'executor' ? "Your Executor Assistant" : "Your Planning Assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(true)}
                  className="h-8 w-8 text-calm-600 hover:text-calm-800"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVisible(false)}
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Add role toggle if user has both roles */}
            {userRole === 'planner' && (
              <div className="flex justify-center mt-2">
                <div className="bg-calm-100 p-1 rounded-full flex text-xs">
                  <button 
                    className={`px-3 py-1 rounded-full transition-colors ${
                      chatMode === 'planner' 
                        ? 'bg-white shadow-sm text-calm-800' 
                        : 'text-calm-600 hover:text-calm-800'
                    }`}
                    onClick={() => setChatMode('planner')}
                  >
                    Planner Mode
                  </button>
                  <button 
                    className={`px-3 py-1 rounded-full transition-colors ${
                      chatMode === 'executor' 
                        ? 'bg-white shadow-sm text-calm-800' 
                        : 'text-calm-600 hover:text-calm-800'
                    }`}
                    onClick={() => setChatMode('executor')}
                  >
                    Executor Mode
                  </button>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 h-[420px]">
            {chatMode === 'executor' ? (
              <ExecutorChatInterface
                mode="invitation"
                executorName={userRole === 'executor' ? "Executor" : "User"}
                plannerName="Planner"
                context={{ isFloatingAssistant: true }}
                currentStep="floating-chat"
              />
            ) : (
              <PlannerChatInterface
                onStepComplete={(step, data) => {
                  console.log('Step completed:', step, data);
                }}
                currentStep="floating-chat"
                context={{ isFloatingAssistant: true }}
                className="h-full border-none"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}