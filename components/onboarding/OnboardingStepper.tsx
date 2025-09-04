// Usage: <OnboardingStepper />
"use client";

import { useOnboarding, ONBOARDING_STEPS } from "@/contexts/OnboardingContext";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function OnboardingStepper() {
	const { currentStep } = useOnboarding();

	return (
		<div className="flex items-center justify-center gap-1 sm:gap-2 text-xs">
			{ONBOARDING_STEPS.map((step, index) => (
				<div key={step.id} className="flex items-center">
					<div
						className={cn(
							"flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full border text-xs font-medium transition-colors",
							index < currentStep
								? "bg-green-100 border-green-200 text-green-700"
								: index === currentStep
								? "bg-blue-100 border-blue-200 text-blue-700"
								: "bg-gray-100 border-gray-200 text-gray-500"
						)}
					>
						{index < currentStep ? (
							<Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
						) : (
							<span className="text-xs">{step.id + 1}</span>
						)}
					</div>
					{index < ONBOARDING_STEPS.length - 1 && (
						<div
							className={cn(
								"h-0.5 w-4 sm:w-8 transition-colors",
								index < currentStep ? "bg-green-200" : "bg-gray-200"
							)}
						/>
					)}
				</div>
			))}
		</div>
	);
}
