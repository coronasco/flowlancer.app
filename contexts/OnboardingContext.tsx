"use client";

import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { useSession } from "@/contexts/SessionContext";

export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

export type OnboardingState = {
	currentStep: OnboardingStep;
	isCompleted: boolean;
	setStep: (step: OnboardingStep) => void;
	nextStep: () => void;
	completeOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingState | null>(null);

const ONBOARDING_STEPS = [
	{ id: 0, title: "Welcome", description: "Let's get you started with Flowlancer" },
	{ id: 1, title: "Profile", description: "Set up your professional profile" },
	{ id: 2, title: "Hourly Rate", description: "Configure your pricing with AI assistance" },
	{ id: 3, title: "Public Profile", description: "Make your profile discoverable" },
	{ id: 4, title: "Project Manager", description: "Learn about task tracking and time management" },
	{ id: 5, title: "Invoices", description: "Create professional invoices from your work" },
] as const;

export function OnboardingProvider({ children }: { children: ReactNode }) {
	const { user } = useSession();
	const [currentStep, setCurrentStep] = useState<OnboardingStep>(0);
	const [isCompleted, setIsCompleted] = useState(false);

	// Load onboarding progress from localStorage
	useEffect(() => {
		if (!user) return;
		
		const stored = localStorage.getItem(`onboarding_${user.uid}`);
		if (stored) {
			try {
				const { step, completed } = JSON.parse(stored);
				setCurrentStep(completed ? 5 : (step || 0));
				setIsCompleted(completed || false);
			} catch {
				// Invalid stored data, start from beginning
			}
		}
	}, [user]);

	// Save onboarding progress to localStorage
	const saveProgress = (step: OnboardingStep, completed = false) => {
		if (!user) return;
		localStorage.setItem(`onboarding_${user.uid}`, JSON.stringify({ step, completed }));
	};

	const setStep = (step: OnboardingStep) => {
		setCurrentStep(step);
		saveProgress(step);
	};

	const nextStep = () => {
		const next = Math.min(currentStep + 1, 5) as OnboardingStep;
		setStep(next);
	};

	const completeOnboarding = () => {
		setIsCompleted(true);
		setCurrentStep(5);
		saveProgress(5, true);
	};

	const value: OnboardingState = {
		currentStep,
		isCompleted,
		setStep,
		nextStep,
		completeOnboarding,
	};

	return (
		<OnboardingContext.Provider value={value}>
			{children}
		</OnboardingContext.Provider>
	);
}

export function useOnboarding() {
	const context = useContext(OnboardingContext);
	if (!context) {
		throw new Error("useOnboarding must be used within an OnboardingProvider");
	}
	return context;
}

export { ONBOARDING_STEPS };