import { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Send, Loader2 } from 'lucide-react';
import EmmaAvatar from './EmmaAvatar';
import { sendClaudeMessage, ClaudeMessage, EMMA_EXECUTOR_INVITATION_PROMPT, EMMA_EXECUTOR_ONBOARDING_PROMPT } from '../../lib/claude';
import { cn } from '../../lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  mood?: 'default' | 'celebrating' | 'encouraging';
}

interface ExecutorChatInterfaceProps {
  onStepComplete?: (step: string, data: any) => void;
  currentStep?: string;
  context?: Record<string, any>;
  className?: string;
  mode: 'invitation' | 'onboarding';
  executorName?: string;
  plannerName?: string;
}

export default function ExecutorChatInterface({ 
  onStepComplete, 
  currentStep, 
  context = {},
  className,
  mode,
  executorName = 'Executor',
  plannerName = 'Planner'
}: ExecutorChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set initial message based on mode
  useEffect(() => {
    let initialMessage: ChatMessage;
    
    if (mode === 'invitation') {
      initialMessage = {
        id: '1',
        role: 'assistant',
        content: `Hi ${executorName}, I'm Emma. ${plannerName} has chosen you as their executor. This means they trust you to handle their affairs when needed. You don't need to do anything right now - ${plannerName} is still organizing everything. When the time comes, I'll guide you through each step.`,
        timestamp: new Date(),
        mood: 'encouraging'
      };
    } else {
      initialMessage = {
        id: '1',
        role: 'assistant',
        content: `I'm sorry for your loss, ${executorName}. I know this is a difficult time. ${plannerName} organized everything to support you through this process. I'll help you honor their wishes while taking care of yourself. When you're ready, we'll verify your identity and then access the important documents you'll need.`,
        timestamp: new Date(),
        mood: 'default'
      };
    }
    
    setMessages([initialMessage]);
  }, [mode, executorName, plannerName]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare context for Claude
      const contextString = Object.keys(context).length > 0 
        ? `\n\nCurrent context: ${JSON.stringify(context, null, 2)}`
        : '';
      
      const stepContext = currentStep 
        ? `\n\nCurrent step: ${currentStep}`
        : '';

      const claudeMessages: ClaudeMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      claudeMessages.push({ role: 'user', content: inputValue });

      const systemPrompt = mode === 'invitation' 
        ? EMMA_EXECUTOR_INVITATION_PROMPT + contextString + stepContext
        : EMMA_EXECUTOR_ONBOARDING_PROMPT + contextString + stepContext;
      
      const response = await sendClaudeMessage(claudeMessages, systemPrompt);

      // Determine Emma's mood based on response content
      let mood: 'default' | 'celebrating' | 'encouraging' = 'default';
      if (response.includes('🎉') || response.includes('✅')) {
        mood = 'celebrating';
      } else if (response.includes('I understand') || response.includes('take your time')) {
        mood = 'encouraging';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        mood
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Check if Emma is suggesting to move to next step
      if (response.toLowerCase().includes('ready for the next step') || 
          response.toLowerCase().includes('move on to') ||
          response.toLowerCase().includes('let\'s proceed')) {
        // Trigger step completion if applicable
        onStepComplete?.(currentStep || 'chat', { lastMessage: response });
      }

    } catch (error) {
      console.error('Error sending message to Emma:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize for the difficulty. It seems we're having a technical issue. Please take your time, and when you're ready, we can try again. Remember, there's no rush to complete this process.",
        timestamp: new Date(),
        mood: 'encouraging'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={cn("flex flex-col h-96", className)}>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <EmmaAvatar size="sm" mood={message.mood} />
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === 'user'
                      ? 'bg-calm-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <EmmaAvatar size="sm" />
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Emma is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={mode === 'invitation' 
                ? "Type your message to Emma..." 
                : "Take your time. Type when you're ready..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}