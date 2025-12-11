"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  Sparkles,
  Globe,
  Loader2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Step configuration
const STEPS = [
  { id: 1, title: "Business Info", description: "Tell us about your workshop" },
  { id: 2, title: "Account Details", description: "Create your admin account" },
  { id: 3, title: "Confirmation", description: "Review and confirm" },
];

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

const slideVariants: Variants = {
  enter: (custom: unknown) => {
    const direction = typeof custom === "number" ? custom : 0;
    return {
      x: direction > 0 ? 100 : -100,
      opacity: 0
    };
  },
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  },
  exit: (custom: unknown) => {
    const direction = typeof custom === "number" ? custom : 0;
    return {
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.2 }
    };
  }
};

interface FormData {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  website: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterForm() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    businessEmail: "",
    businessPhone: "",
    website: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.businessName.trim()) {
          setError("Business name is required");
          return false;
        }
        if (!formData.businessEmail.trim() || !formData.businessEmail.includes("@")) {
          setError("Valid business email is required");
          return false;
        }
        return true;
      case 2:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("First and last name are required");
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          setError("Valid email is required");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setDirection(1);
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError("");
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant: {
            name: formData.businessName,
            email: formData.businessEmail,
            phone: formData.businessPhone,
            website: formData.website,
          },
          admin: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful creation, immediately log the user in to start the onboarding
        // This requires a separate login API call
        const loginResponse = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });

        if (loginResponse.ok && data.needsOnboarding) {
            router.push("/onboarding");
        } else if (loginResponse.ok) {
            router.push("/dashboard");
        }
        else {
            // If login fails, redirect to login page with a success message
            router.push("/login?registered=true");
        }
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#063479] to-[#052a5f] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#F97402]/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-[#F13F33]/10 to-transparent rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-lg">
        {/* Back Button */}
        <Link
          href="/login"
          className="absolute -top-12 left-0 flex items-center text-white/80 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 me-2 group-hover:-translate-x-1 transition-transform" />
          Back to login
        </Link>

        <motion.div
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700 relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Theme Toggle */}
          <div className="absolute top-6 right-6">
            <ThemeToggle />
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 bg-gradient-to-br from-[#F97402] to-[#F13F33] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#F97402]/25"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <Building2 className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Your Workshop
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Start your free trial today
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8 px-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${currentStep >= step.id
                      ? "bg-gradient-to-br from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                    }
                  `}
                  initial={false}
                  animate={{
                    scale: currentStep === step.id ? 1.1 : 1,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  {currentStep > step.id ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 rounded-full transition-colors duration-300 ${
                      currentStep > step.id ? "bg-[#F97402]" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50/90 dark:bg-red-900/50 border border-red-200 dark:border-red-700 rounded-2xl text-red-700 dark:text-red-300 text-sm backdrop-blur-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Steps */}
          <AnimatePresence mode="wait" custom={direction}>
            {currentStep === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Building2 className="w-4 h-4 inline-block me-2" />
                    Workshop Name *
                  </label>
                  <input
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    type="text"
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                    placeholder="e.g. Quick Fix Auto Repairs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Mail className="w-4 h-4 inline-block me-2" />
                    Business Email *
                  </label>
                  <input
                    name="businessEmail"
                    value={formData.businessEmail}
                    onChange={handleInputChange}
                    type="email"
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                    placeholder="contact@yourworkshop.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Phone className="w-4 h-4 inline-block me-2" />
                    Phone Number
                  </label>
                  <input
                    name="businessPhone"
                    value={formData.businessPhone}
                    onChange={handleInputChange}
                    type="tel"
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                    placeholder="+966 50 123 4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Globe className="w-4 h-4 inline-block me-2" />
                    Website (Optional)
                  </label>
                  <input
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    type="url"
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                    placeholder="https://yourworkshop.com"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                      First Name *
                    </label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      type="text"
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                      Last Name *
                    </label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      type="text"
                      required
                      className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Mail className="w-4 h-4 inline-block me-2" />
                    Your Email *
                  </label>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    type="email"
                    required
                    className="w-full px-4 py-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                    placeholder="you@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Lock className="w-4 h-4 inline-block me-2" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                    <Lock className="w-4 h-4 inline-block me-2" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-4 focus:ring-[#F97402]/20 focus:border-[#F97402] transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 bg-white/80 dark:bg-gray-800"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/25"
                >
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Welcome to TeraMotors!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Your workshop <span className="font-semibold text-[#F97402]">{formData.businessName}</span> has been created.
                  </p>
                  <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="w-4 h-4 me-2 text-[#F97402]" />
                    Redirecting to login...
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currentStep === 1
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <ArrowLeft className="w-4 h-4 me-2" />
                Back
              </button>

              {currentStep === 2 ? (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25 hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 me-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Workshop
                      <Sparkles className="w-4 h-4 ms-2" />
                    </>
                  )}
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25 hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ms-2" />
                </motion.button>
              )}
            </div>
          )}

          {/* Footer */}
          {currentStep < 3 && (
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link href="/login" className="text-[#F97402] dark:text-[#F97402] font-semibold hover:text-[#F13F33] dark:hover:text-[#F13F33] transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>

        {/* Features List */}
        <motion.div
          className="mt-8 grid grid-cols-3 gap-4 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {[
            { icon: "14", label: "Day Free Trial" },
            { icon: "0", label: "Setup Fees" },
            { icon: "24/7", label: "Support" },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-white/80"
            >
              <div className="text-2xl font-bold text-white">{feature.icon}</div>
              <div className="text-xs">{feature.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#063479] to-[#052a5f] dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
