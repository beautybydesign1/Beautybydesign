"use client";

import React from "react";

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export default function StepIndicator({
    currentStep,
    totalSteps,
}: StepIndicatorProps) {
    return (
        <div className="step-indicator" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={totalSteps}>
            {Array.from({ length: totalSteps }, (_, i) => {
                const step = i + 1;
                const isCompleted = step < currentStep;
                const isActive = step === currentStep;

                return (
                    <React.Fragment key={step}>
                        {i > 0 && (
                            <div
                                className={`step-line ${isCompleted ? "completed" : ""}`}
                            />
                        )}
                        <div
                            className={`step-dot ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""
                                }`}
                            aria-label={`Step ${step}${isActive ? " (current)" : ""}${isCompleted ? " (completed)" : ""
                                }`}
                        >
                            {isCompleted && (
                                <svg
                                    width="8"
                                    height="8"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    style={{ display: "block", margin: "auto" }}
                                >
                                    <path
                                        d="M2 6L5 9L10 3"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            )}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
}
