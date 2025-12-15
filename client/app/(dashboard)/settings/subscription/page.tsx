"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  CreditCard,
  Check,
  Star,
  Zap,
  ArrowRight,
  ArrowLeft,
  Crown,
  Building2,
  Calendar,
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Users,
  FileText,
  Car,
  Package,
} from "lucide-react";
import { useSession } from "@/lib/hooks/useSession";
import { SUBSCRIPTION_TIERS, getTierConfig, type SubscriptionTier } from "@/lib/subscription/tiers";

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
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

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

// Mock current subscription data - will be fetched from API
interface SubscriptionData {
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodEnd: Date;
  trialEndsAt?: Date;
  cancelAtPeriodEnd: boolean;
  usage: {
    customers: number;
    vehicles: number;
    invoices: number;
    users: number;
  };
}

const tierIcons: Record<SubscriptionTier, typeof Star> = {
  free: Zap,
  basic: Star,
  pro: Crown,
  enterprise: Building2,
};

export default function SubscriptionPage() {
  const { user } = useSession();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);

  useEffect(() => {
    // Simulate API call - replace with actual API
    const fetchSubscription = async () => {
      try {
        // Mock data - replace with: const response = await fetch('/api/tenant/subscription')
        await new Promise(resolve => setTimeout(resolve, 500));
        setSubscription({
          tier: 'basic',
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          trialEndsAt: undefined,
          cancelAtPeriodEnd: false,
          usage: {
            customers: 125,
            vehicles: 87,
            invoices: 342,
            users: 3,
          }
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const currentTier = subscription?.tier || 'free';
  const currentConfig = getTierConfig(currentTier);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2, label: 'Active' };
      case 'trialing':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Zap, label: 'Trial' };
      case 'past_due':
        return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Past Due' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Cancelled' };
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Star, label: status };
    }
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    setSelectedTier(tier);
    setShowUpgradeModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="w-8 h-8 text-[#F97402] animate-spin" />
          <p className="mt-4 text-gray-500">Loading subscription...</p>
        </motion.div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(subscription?.status || 'active');
  const StatusIcon = statusBadge.icon;
  const TierIcon = tierIcons[currentTier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/settings" className="me-4">
                <motion.button
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ x: -3 }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </motion.button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Subscription & Billing
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Manage your plan, billing, and usage
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Current Plan Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentConfig.color} flex items-center justify-center shadow-lg`}>
                    <TierIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="ms-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {currentConfig.name} Plan
                      </h2>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                        <StatusIcon className="w-3.5 h-3.5 me-1.5" />
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      {currentConfig.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {currentTier !== 'enterprise' && (
                    <motion.button
                      className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25 hover:shadow-xl transition-shadow"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleUpgrade('pro')}
                    >
                      <Zap className="w-4 h-4 me-2" />
                      Upgrade Plan
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Billing Info */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <CreditCard className="w-4 h-4 me-2" />
                    Monthly Price
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentConfig.pricing.monthly === 0 ? 'Free' : `SAR ${currentConfig.pricing.monthly}`}
                    {currentConfig.pricing.monthly > 0 && <span className="text-sm font-normal text-gray-500">/mo</span>}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <Calendar className="w-4 h-4 me-2" />
                    Next Billing Date
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscription?.currentPeriodEnd
                      ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      : '-'}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <RefreshCw className="w-4 h-4 me-2" />
                    Auto-Renew
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {subscription?.cancelAtPeriodEnd ? 'Off' : 'On'}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Usage Stats */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Usage & Limits
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Customers',
                    icon: Users,
                    used: subscription?.usage.customers || 0,
                    limit: currentConfig.limits.maxCustomers,
                    color: 'from-blue-500 to-blue-600'
                  },
                  {
                    label: 'Vehicles',
                    icon: Car,
                    used: subscription?.usage.vehicles || 0,
                    limit: currentConfig.limits.maxVehicles,
                    color: 'from-emerald-500 to-green-600'
                  },
                  {
                    label: 'Monthly Invoices',
                    icon: FileText,
                    used: subscription?.usage.invoices || 0,
                    limit: currentConfig.limits.maxInvoicesPerMonth,
                    color: 'from-purple-500 to-purple-600'
                  },
                  {
                    label: 'Users',
                    icon: Users,
                    used: subscription?.usage.users || 0,
                    limit: currentConfig.limits.maxUsers,
                    color: 'from-amber-500 to-orange-600'
                  },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  const percentage = stat.limit === -1 ? 0 : (stat.used / stat.limit) * 100;
                  const isUnlimited = stat.limit === -1;

                  return (
                    <motion.div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="ms-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {stat.label}
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.used.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500 ms-1">
                          / {isUnlimited ? '∞' : stat.limit.toLocaleString()}
                        </span>
                      </div>
                      {!isUnlimited && (
                        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${stat.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Available Plans */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Available Plans
              </h3>

              {/* Billing Toggle */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                  onClick={() => setBillingCycle('annual')}
                >
                  Annual
                  <span className="ms-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.entries(SUBSCRIPTION_TIERS) as [SubscriptionTier, typeof SUBSCRIPTION_TIERS.free][]).map(
                ([tier, config], index) => {
                  const isCurrentPlan = tier === currentTier;
                  const TierIcon = tierIcons[tier];
                  const price = billingCycle === 'annual' ? config.pricing.annual : config.pricing.monthly;

                  return (
                    <motion.div
                      key={tier}
                      variants={cardVariants}
                      className={`relative bg-white dark:bg-gray-800 rounded-3xl border-2 overflow-hidden ${
                        config.popular
                          ? 'border-[#F97402] shadow-xl shadow-[#F97402]/10'
                          : isCurrentPlan
                          ? 'border-blue-500'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                      whileHover={{ y: -5, transition: { type: "spring", stiffness: 300 } }}
                    >
                      {/* Popular Badge */}
                      {config.popular && (
                        <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white text-xs font-semibold text-center py-1.5">
                          Most Popular
                        </div>
                      )}

                      <div className={`p-6 ${config.popular ? 'pt-10' : ''}`}>
                        {/* Header */}
                        <div className="flex items-center mb-4">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shadow-md`}>
                            <TierIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="ms-3">
                            <h4 className="font-bold text-gray-900 dark:text-white">
                              {config.name}
                            </h4>
                            {isCurrentPlan && (
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Current Plan
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                          <div className="flex items-baseline">
                            {price === -1 ? (
                              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                Custom
                              </span>
                            ) : price === 0 ? (
                              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                Free
                              </span>
                            ) : (
                              <>
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                  SAR {billingCycle === 'annual' ? Math.round(price / 12) : price}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ms-1">/mo</span>
                              </>
                            )}
                          </div>
                          {billingCycle === 'annual' && price > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Billed SAR {price}/year
                            </p>
                          )}
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 mb-6">
                          {config.features.slice(0, 5).map((feature, i) => (
                            <li key={i} className="flex items-start text-sm">
                              <Check className="w-4 h-4 text-emerald-500 me-2 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-600 dark:text-gray-300">{feature.name}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA */}
                        {isCurrentPlan ? (
                          <button
                            disabled
                            className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold rounded-xl"
                          >
                            Current Plan
                          </button>
                        ) : (
                          <motion.button
                            className={`w-full py-3 px-4 font-semibold rounded-xl transition-all ${
                              config.popular
                                ? 'bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white shadow-lg shadow-[#F97402]/25 hover:shadow-xl'
                                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleUpgrade(tier)}
                          >
                            {tier === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                }
              )}
            </div>
          </motion.div>

          {/* Billing History */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Billing History
                </h3>
                <motion.button
                  className="text-sm text-[#F97402] hover:text-[#F13F33] font-semibold flex items-center"
                  whileHover={{ x: 3 }}
                >
                  View All
                  <ChevronRight className="w-4 h-4 ms-1" />
                </motion.button>
              </div>

              <div className="space-y-3">
                {[
                  { date: 'Dec 1, 2024', amount: 199, status: 'Paid', invoice: '#INV-2024-012' },
                  { date: 'Nov 1, 2024', amount: 199, status: 'Paid', invoice: '#INV-2024-011' },
                  { date: 'Oct 1, 2024', amount: 199, status: 'Paid', invoice: '#INV-2024-010' },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                    whileHover={{ x: 3 }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="ms-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.invoice}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        SAR {item.amount}
                      </span>
                      <motion.button
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && selectedTier && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getTierConfig(selectedTier).color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  {(() => {
                    const Icon = tierIcons[selectedTier];
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Upgrade to {getTierConfig(selectedTier).name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {selectedTier === 'enterprise'
                    ? 'Contact our sales team to discuss enterprise pricing and custom features.'
                    : `You'll be charged SAR ${getTierConfig(selectedTier).pricing.monthly}/month starting today.`
                  }
                </p>

                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 px-4 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUpgradeModal(false)}
                  >
                    Cancel
                  </button>
                  <motion.button
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#F97402] to-[#F13F33] text-white font-semibold rounded-xl shadow-lg shadow-[#F97402]/25"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {selectedTier === 'enterprise' ? 'Contact Sales' : 'Confirm Upgrade'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
