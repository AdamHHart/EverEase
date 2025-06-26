import { CheckCircle, Circle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStepId: string;
  className?: string;
}

export default function ProgressTracker({ steps, currentStepId, className }: ProgressTrackerProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Your Planning Progress</h3>
        <div className="text-sm text-gray-600">
          {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isUpcoming = step.status === 'upcoming';

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-lg transition-all",
                isCompleted && "bg-green-50 border border-green-200",
                isCurrent && "bg-calm-50 border border-calm-200 shadow-sm",
                isUpcoming && "bg-gray-50 border border-gray-200"
              )}
            >
              <div className="flex-shrink-0 mt-1">
                {isCompleted && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {isCurrent && (
                  <Clock className="h-6 w-6 text-calm-600" />
                )}
                {isUpcoming && (
                  <Circle className="h-6 w-6 text-gray-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">
                    Step {index + 1}
                  </span>
                  {isCompleted && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Complete
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-xs bg-calm-100 text-calm-800 px-2 py-1 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                <h4 className={cn(
                  "font-medium mt-1",
                  isCompleted && "text-green-900",
                  isCurrent && "text-calm-900",
                  isUpcoming && "text-gray-600"
                )}>
                  {step.title}
                </h4>
                <p className={cn(
                  "text-sm mt-1",
                  isCompleted && "text-green-700",
                  isCurrent && "text-calm-700",
                  isUpcoming && "text-gray-500"
                )}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>
            {Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-calm-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}