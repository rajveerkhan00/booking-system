"use client"

import type { BookingStep } from "./booking-form"
import { Car, Settings, FileText, CheckCircle, Check } from "lucide-react"

interface ProgressBarProps {
  currentStep: BookingStep
  onStepClick?: (step: BookingStep) => void
  completedSteps?: Partial<Record<BookingStep, boolean>>
}

const steps: { key: BookingStep; label: string; icon: React.ElementType }[] = [
  { key: "search", label: "SELECT CAR", icon: Car },
  { key: "options", label: "OPTIONS", icon: Settings },
  { key: "details", label: "DETAILS", icon: FileText },
  { key: "confirmation", label: "CONFIRM", icon: CheckCircle },
]

export function ProgressBar({ currentStep, onStepClick, completedSteps = {} }: ProgressBarProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  const handleClick = (step: BookingStep, index: number) => {
    if (onStepClick && index <= currentIndex) {
      onStepClick(step)
    }
  }

  return (
    <div className="glass-card-elevated p-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex || completedSteps[step.key]
          const isCurrent = index === currentIndex
          const isClickable = index <= currentIndex
          const IconComponent = step.icon

          return (
            <div key={step.key} className="flex items-center flex-1">
              {/* Step indicator */}
              <div
                className={`flex items-center gap-4 flex-1 ${isClickable ? 'cursor-pointer group' : 'cursor-default'}`}
                onClick={() => handleClick(step.key, index)}
              >
                {/* Step circle */}
                <div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-sm transition-all duration-500 ${isCompleted
                    ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-glow-primary"
                    : isCurrent
                      ? "bg-gradient-to-br from-secondary to-secondary-dark text-white shadow-glow-secondary ring-4 ring-secondary/50"
                      : "bg-gray-50 text-gray-400 border-2 border-gray-200"
                    } ${isClickable && !isCurrent ? 'group-hover:scale-105' : ''}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 animate-scale-in" strokeWidth={3} />
                  ) : (
                    <IconComponent className="w-5 h-5" strokeWidth={2} />
                  )}

                  {/* Pulse animation for current step */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-2xl animate-ping bg-secondary/20" />
                  )}
                </div>

                {/* Step label */}
                <div className="hidden md:block">
                  <p
                    className={`font-semibold text-sm tracking-wide transition-colors duration-300 ${isCurrent
                      ? "text-secondary"
                      : isCompleted
                        ? "text-primary"
                        : "text-gray-400"
                      }`}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-secondary/80 mt-0.5 font-medium">In progress</p>
                  )}
                  {isCompleted && (
                    <p className="text-xs text-primary/80 mt-0.5 font-medium">Completed</p>
                  )}
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-4 md:mx-6 h-1 sm:h-1.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${index < currentIndex
                      ? "bg-gradient-to-r from-primary to-primary/80 w-full"
                      : index === currentIndex
                        ? "bg-gradient-to-r from-secondary to-secondary/80 w-1/2"
                        : "w-0"
                      }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile step indicator */}
      <div className="md:hidden mt-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl">
          <span className="text-sm text-gray-500">Step</span>
          <span className="text-lg font-bold text-secondary">{currentIndex + 1}</span>
          <span className="text-sm text-gray-500">of {steps.length}</span>
        </div>
        <p className="text-lg font-bold text-gray-800 mt-2">
          {steps[currentIndex].label}
        </p>
      </div>
    </div>
  )
}
