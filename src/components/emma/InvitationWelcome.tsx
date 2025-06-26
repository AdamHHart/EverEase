import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import EmmaAvatar from './EmmaAvatar';
import ExecutorChatInterface from './ExecutorChatInterface';
import { ShieldCheck, CheckCircle } from 'lucide-react';

interface InvitationWelcomeProps {
  executorName: string;
  plannerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function InvitationWelcome({ 
  executorName, 
  plannerName, 
  onAccept, 
  onDecline 
}: InvitationWelcomeProps) {
  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>You've Been Invited as an Executor</CardTitle>
              <CardDescription>
                {plannerName} has chosen you to help carry out their wishes when the time comes
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-white rounded-lg p-4 border border-blue-100 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">What This Means</h3>
            <p className="text-sm text-blue-800 mb-3">
              Being chosen as an executor is a significant responsibility and shows how much {plannerName} trusts you. 
              As an executor, you would:
            </p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Help carry out their wishes after they pass away</li>
              <li>• Have access to important documents and information they've organized</li>
              <li>• Receive guidance through the process when the time comes</li>
              <li>• Be able to contact relevant organizations and manage affairs</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <h3 className="font-medium text-blue-900 mb-2">What Happens Now?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Accept the invitation</p>
                  <p className="text-xs text-blue-700">Confirm your willingness to serve as an executor</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Create your account</p>
                  <p className="text-xs text-blue-700">Set up secure access to the platform</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Wait until needed</p>
                  <p className="text-xs text-blue-700">You won't need to do anything else until the time comes</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onDecline}
            className="flex-1"
          >
            Decline
          </Button>
          <Button 
            onClick={onAccept}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Accept Invitation
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <EmmaAvatar size="md" mood="encouraging" />
            <CardTitle>Chat with Emma</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ExecutorChatInterface 
            mode="invitation"
            executorName={executorName}
            plannerName={plannerName}
            context={{
              invitationStatus: 'pending',
              executorName,
              plannerName
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}