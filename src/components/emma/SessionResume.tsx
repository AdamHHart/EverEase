import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import EmmaAvatar from './EmmaAvatar';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';

interface SessionResumeProps {
  executorName: string;
  plannerName: string;
  lastSessionSummary: string;
  completedSteps: string[];
  currentStep: string;
  onContinue: () => void;
}

export default function SessionResume({ 
  executorName, 
  plannerName, 
  lastSessionSummary, 
  completedSteps, 
  currentStep, 
  onContinue 
}: SessionResumeProps) {
  return (
    <Card className="border-blue-200">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="flex items-center gap-3">
          <EmmaAvatar size="md" mood="encouraging" />
          <div>
            <h2 className="text-xl">Welcome back, {executorName}</h2>
            <p className="text-sm text-blue-700">Let's continue where you left off</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Your Progress So Far
          </h3>
          <div className="space-y-2">
            {completedSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                <p className="text-sm text-blue-800">{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            Next Step: {currentStep}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We'll pick up exactly where you left off. Remember, you can take breaks whenever you need to.
          </p>
          <Button 
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Continue Process
          </Button>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Session Summary</h3>
          <p className="text-sm text-gray-600 whitespace-pre-line">
            {lastSessionSummary || `In your last session, you began the process of managing ${plannerName}'s estate. You can continue at your own pace.`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}