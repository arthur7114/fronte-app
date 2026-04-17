"use client";

import { CheckCircle2, Circle, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "complete" | "current" | "pending";

type Step = {
  id: string;
  name: string;
  description: string;
  status: StepStatus;
  href: string;
};

type EditorialPipelineProps = {
  steps: Step[];
};

export function EditorialPipeline({ steps }: EditorialPipelineProps) {
  return (
    <nav aria-label="Progress" className="dashboard-surface rounded-xl p-6 mb-8">
      <ol role="list" className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className="flex-1">
            <div className="group flex flex-col border-l-4 border-transparent py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4 transition-all duration-300">
              <span className={cn(
                "text-xs font-semibold uppercase tracking-[0.24em]",
                step.status === "complete" ? "text-primary" : 
                step.status === "current" ? "text-primary" : "text-muted-foreground"
              )}>
                Passo {stepIdx + 1}
              </span>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">
                  {step.name}
                </span>
                {step.status === "complete" && <CheckCircle2 className="h-4 w-4 text-primary" />}
                {step.status === "current" && <Clock className="h-4 w-4 text-primary animate-pulse" />}
                {step.status === "pending" && <Circle className="h-4 w-4 text-muted-foreground/30" />}
              </div>
              
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {step.description}
              </p>

              <div className={cn(
                "mt-4 h-1 w-full rounded-full transition-all duration-500",
                step.status === "complete" ? "bg-primary" : 
                step.status === "current" ? "bg-primary/20" : "bg-muted/10"
              )} />
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
