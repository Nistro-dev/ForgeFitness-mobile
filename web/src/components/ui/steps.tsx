import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface StepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const Steps: React.FC<StepsProps> = ({ steps, currentStep, onStepClick, className }) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Circle */}
              <div className="flex items-center">
                <button
                  onClick={() => onStepClick?.(index)}
                  disabled={!onStepClick}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                    isCompleted && "bg-green-600 border-green-600 text-white",
                    isCurrent && "bg-blue-600 border-blue-600 text-white",
                    isUpcoming && "bg-slate-700 border-slate-600 text-slate-400",
                    onStepClick && "hover:scale-105 cursor-pointer",
                    !onStepClick && "cursor-default"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                
                {/* Step Content */}
                <div className="ml-4 min-w-0">
                  <h3 className={cn(
                    "text-sm font-medium transition-colors",
                    isCompleted && "text-green-400",
                    isCurrent && "text-blue-400",
                    isUpcoming && "text-slate-400"
                  )}>
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className={cn(
                      "text-xs transition-colors",
                      isCompleted && "text-green-300",
                      isCurrent && "text-blue-300",
                      isUpcoming && "text-slate-500"
                    )}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors",
                  isCompleted ? "bg-green-600" : "bg-slate-700"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
