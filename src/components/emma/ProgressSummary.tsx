import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface CompletedTask {
  id: string;
  name: string;
  category: string;
  completedAt: string;
}

interface NextTask {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface ProgressSummaryProps {
  completedTasks: CompletedTask[];
  nextTasks: NextTask[];
  sessionCount: number;
  lastActive: string;
}

export default function ProgressSummary({ 
  completedTasks, 
  nextTasks, 
  sessionCount, 
  lastActive 
}: ProgressSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Welcome Back</h3>
          <p className="text-sm text-blue-800">
            This is your {sessionCount === 1 ? 'first' : sessionCount === 2 ? 'second' : `${sessionCount}th`} session. 
            Your last activity was on {new Date(lastActive).toLocaleDateString()} at {new Date(lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.
          </p>
        </div>

        {completedTasks.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed Tasks
            </h3>
            <div className="space-y-2">
              {completedTasks.map(task => (
                <div key={task.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between">
                    <p className="font-medium text-green-900">{task.name}</p>
                    <p className="text-xs text-green-700">
                      {new Date(task.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-green-700 capitalize">{task.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {nextTasks.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-blue-500" />
              Next Steps
            </h3>
            <div className="space-y-2">
              {nextTasks.map(task => (
                <div key={task.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="font-medium">{task.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{task.category}</p>
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}