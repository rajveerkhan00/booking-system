"use client"

import type { TransferStep } from "./transfer-booking-form"
import { Search, FileText, CheckCircle, Check } from "lucide-react"

interface TransferProgressBarProps {
    currentStep: TransferStep
    onStepClick?: (step: TransferStep) => void
}

const steps: { key: TransferStep; number: number; label: string; icon: React.ElementType }[] = [
    { key: "search", number: 1, label: "Search Results", icon: Search },
    { key: "details", number: 2, label: "Transfer Details", icon: FileText },
    { key: "confirmation", number: 3, label: "Confirmation", icon: CheckCircle },
]

export function TransferProgressBar({ currentStep, onStepClick }: TransferProgressBarProps) {
    const currentIndex = steps.findIndex((s) => s.key === currentStep)

    const handleClick = (step: TransferStep, index: number) => {
        if (onStepClick && index < currentIndex) {
            onStepClick(step)
        }
    }

    return (
        <div className="glass-card-elevated flex items-center justify-center py-8 px-6">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex
                const isCurrent = index === currentIndex
                const isClickable = index < currentIndex
                const IconComponent = step.icon

                return (
                    <div key={step.key} className="flex items-center">
                        {/* Step indicator */}
                        <div
                            className={`flex flex-col items-center ${isClickable ? 'cursor-pointer group' : 'cursor-default'}`}
                            onClick={() => handleClick(step.key, index)}
                        >
                            {/* Step circle */}
                            <div
                                className={`relative flex items-center justify-center w-12 h-12 rounded-2xl font-bold text-sm transition-all duration-500 ${isCompleted
                                    ? "bg-white border-2 border-primary text-primary shadow-soft group-hover:scale-105"
                                    : isCurrent
                                        ? "bg-gradient-to-br from-primary to-primary-dark text-white shadow-glow-primary"
                                        : "bg-white border-2 border-gray-200 text-gray-400"
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-primary" strokeWidth={3} />
                                ) : (
                                    <IconComponent className="w-5 h-5" strokeWidth={2} />
                                )}

                                {/* Pulse animation for current step */}
                                {isCurrent && (
                                    <span className="absolute inset-0 rounded-2xl animate-ping bg-primary opacity-20" />
                                )}
                            </div>

                            {/* Step label */}
                            <p
                                className={`mt-3 text-sm font-semibold transition-colors duration-300 ${isCurrent
                                    ? "text-primary"
                                    : isCompleted
                                        ? "text-primary"
                                        : "text-gray-400"
                                    }`}
                            >
                                {step.label}
                            </p>
                        </div>

                        {/* Connector line */}
                        {index < steps.length - 1 && (
                            <div className="w-24 md:w-36 lg:w-44 h-1 mx-6 relative top-[-12px] rounded-full overflow-hidden bg-gray-100">
                                <div
                                    className={`absolute inset-0 rounded-full transition-all duration-700 ease-out ${index < currentIndex
                                        ? "bg-gradient-to-r from-primary to-primary/80 w-full"
                                        : "w-0"
                                        }`}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
