"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;

        return (
          <div key={stepNumber} className="flex items-center">
            {/* Cercle de l'étape */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                isActive
                  ? "bg-nokta-one-blue border-nokta-one-blue"
                  : isCompleted
                  ? "bg-green-500 border-green-500"
                  : "bg-transparent border-gray-600"
              }`}
            >
              {isCompleted ? (
                <Check size={20} className="text-white" />
              ) : (
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                >
                  {stepNumber}
                </span>
              )}
            </div>

            {/* Ligne de connexion */}
            {index < totalSteps - 1 && (
              <div
                className={`w-12 h-0.5 mx-2 transition-colors ${
                  isCompleted ? "bg-green-500" : "bg-gray-600"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
