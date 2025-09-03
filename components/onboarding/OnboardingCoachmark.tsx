// Usage: <OnboardingCoachmark step={1} trigger={<Button>Profile</Button>} />
"use client";

import { ReactNode, useState } from "react";
import { useOnboarding, ONBOARDING_STEPS } from "@/contexts/OnboardingContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, X } from "lucide-react";

type OnboardingCoachmarkProps = {
	step: number;
	trigger?: ReactNode;
	title?: string;
	description?: string;
	actionText?: string;
	onAction?: () => void;
};

export function OnboardingCoachmark({ 
	step, 
	trigger, 
	title, 
	description, 
	actionText = "Continue",
	onAction 
}: OnboardingCoachmarkProps) {
	const { currentStep, nextStep, completeOnboarding, isCompleted } = useOnboarding();
	const [isOpen, setIsOpen] = useState(false);
	
	// Don't show if onboarding is completed or we're past this step
	if (isCompleted || currentStep > step) return trigger || null;
	
	// Only show if we're on this step
	if (currentStep !== step) return trigger || null;

	const stepData = ONBOARDING_STEPS[step];
	const isLastStep = step === ONBOARDING_STEPS.length - 1;

	const handleAction = () => {
		if (onAction) {
			onAction();
		}
		
		if (isLastStep) {
			completeOnboarding();
		} else {
			nextStep();
		}
		
		setIsOpen(false);
	};

	const handleTriggerClick = () => {
		setIsOpen(true);
	};

	return (
		<>
			<div 
				onClick={handleTriggerClick}
				className="relative cursor-pointer group"
			>
				{trigger}
				{/* Enhanced Pulsing Ring + Badge */}
				<div className="absolute -top-2 -right-2 flex items-center justify-center">
					{/* Pulsing Ring Animation */}
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-75 animate-ping"></div>
					<div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 animate-pulse"></div>
					
					{/* Main Badge */}
					<div className="relative z-10 w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
						<span className="text-xs font-bold text-white">{step + 1}</span>
					</div>
				</div>
				
				{/* Enhanced border highlight on hover */}
				<div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-300 pointer-events-none"></div>
			</div>

			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<DialogTitle className="flex items-center gap-2">
								<Badge variant="outline">{step + 1}/6</Badge>
								{title || stepData.title}
							</DialogTitle>
							<Button 
								variant="ghost" 
								size="sm" 
								onClick={() => setIsOpen(false)}
								className="h-6 w-6 p-0"
							>
								<X className="h-4 w-4" />
							</Button>
						</div>
					</DialogHeader>
					
					<div className="py-4">
						<p className="text-sm text-foreground/70">
							{description || stepData.description}
						</p>
					</div>

					<DialogFooter className="flex justify-between">
						<Button 
							variant="ghost" 
							onClick={() => setIsOpen(false)}
							className="text-xs"
						>
							Skip for now
						</Button>
						<Button onClick={handleAction} className="flex items-center gap-1">
							{actionText}
							{!isLastStep && <ArrowRight className="h-3 w-3" />}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
