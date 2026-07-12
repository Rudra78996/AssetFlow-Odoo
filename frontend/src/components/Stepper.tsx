"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronRight } from "lucide-react";

export interface Step {
  label: string;
  status: "completed" | "current" | "upcoming";
  detail?: string;
}

interface StepperProps {
  steps: Step[];
  className?: string;
}

export function Stepper({ steps, className }: StepperProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((step, i) => (
        <div key={i} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2 min-w-[100px]">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                step.status === "completed" && "bg-available border-available text-white",
                step.status === "current" && "bg-primary border-primary text-white",
                step.status === "upcoming" && "bg-surface-container-low border-outline-variant text-outline"
              )}
            >
              {step.status === "completed" ? (
                <Check className="w-4 h-4" />
              ) : step.status === "current" ? (
                <span className="w-2 h-2 rounded-full bg-white" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-outline" />
              )}
            </div>
            <div className="text-center">
              <p
                className={cn(
                  "font-label-md text-label-md",
                  step.status === "upcoming" ? "text-on-surface-variant" : "text-on-surface"
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="text-[10px] text-outline mt-0.5">{step.detail}</p>
              )}
            </div>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mx-2 transition-colors",
                step.status === "completed" ? "bg-available" : "bg-outline-variant"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
