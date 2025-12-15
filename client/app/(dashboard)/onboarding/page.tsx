"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

// Placeholder for different onboarding steps
const OnboardingStepWelcome = ({ onNext, onSkip }: { onNext: () => void; onSkip: () => void; }) => (
    <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome to TeraMotors!</h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Let's get your workshop set up in a few quick steps.</p>
        <div className="mt-8 flex justify-center gap-4">
            <button onClick={onSkip} className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Skip for Now
            </button>
            <button onClick={onNext} className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-accent">
                Start Setup
            </button>
        </div>
    </div>
);

// We will embed the real settings components later
const OnboardingStepProfile = ({ onNext, onBack }: { onNext: () => void; onBack: () => void; }) => {
    const router = useRouter();
    return (
        <div className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Set Up Your Company Profile</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Fill in your workshop's details like name, address, and VAT number. You can also upload your company logo here.</p>
            <div className="mt-8 flex justify-center gap-4">
                <button onClick={onBack} className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Back
                </button>
                <button onClick={() => { onNext(); router.push('/settings'); }} className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-accent">
                    Go to Profile Settings
                </button>
            </div>
        </div>
    );
};

const OnboardingStepFirstCustomer = ({ onBack, onFinish }: { onBack: () => void; onFinish: () => void; }) => {
    const router = useRouter();
    return (
        <div className="text-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add Your First Customer</h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Let's add your first customer to the system. You can add their contact details and vehicle information.</p>
            <div className="mt-8 flex justify-center gap-4">
                <button onClick={onBack} className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    Back
                </button>
                <button onClick={() => { onFinish(); router.push('/customers/new'); }} className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-accent">
                    Add First Customer
                </button>
            </div>
        </div>
    );
};

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const fetchOnboardingStatus = async () => {
            try {
                // We can get the tenant settings from the company profile endpoint
                const response = await fetch('/api/settings/company-profile');
                if (response.ok) {
                    const data = await response.json();
                    if (data.settings?.onboardingState?.completed) {
                        router.replace('/dashboard'); // Already completed, redirect away
                    } else if (data.settings?.onboardingState?.step) {
                        setCurrentStep(data.settings.onboardingState.step);
                    }
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchOnboardingStatus();
    }, [router]);

    const updateOnboardingStatus = async (update: { step?: number; completed?: boolean }) => {
        try {
            await fetch('/api/onboarding/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(update),
            });
        } catch (error) {
        }
    };

    const handleNext = () => {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        updateOnboardingStatus({ step: nextStep });
    };

    const handleBack = () => {
        const prevStep = currentStep - 1;
        setCurrentStep(prevStep);
        updateOnboardingStatus({ step: prevStep });
    };

    const handleSkip = () => {
        updateOnboardingStatus({ completed: true });
        router.push('/dashboard');
    };

    const handleFinish = () => {
        updateOnboardingStatus({ completed: true });
        router.push('/dashboard');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <OnboardingStepWelcome onNext={handleNext} onSkip={handleSkip} />;
            case 2:
                return <OnboardingStepProfile onNext={handleNext} onBack={handleBack} />;
            case 3:
                 return <OnboardingStepFirstCustomer onBack={handleBack} onFinish={handleFinish} />;
            default:
                return <OnboardingStepWelcome onNext={handleNext} onSkip={handleSkip} />;
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100/50 dark:bg-black p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                {renderStep()}
            </motion.div>
        </div>
    );
}
