import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Sparkles,
  Crown,
  Gem,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building,
  QrCode,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SubscriptionTier } from '../types';

interface CreatorSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: SubscriptionTier;
  initialSelectedTier?: SubscriptionTier;
  targetCampaignReward?: number;
  onSuccess?: () => void;
  onUpgradeSuccess?: () => void;
}

interface CheckoutSession {
  orderId: string;
  tier: SubscriptionTier;
  planName: string;
  amount: number; // in paise
  priceInr: number; // in rupees
  billingCycle: 'monthly' | 'yearly';
  keyId: string;
  isSimulated: boolean;
  prefill?: {
    name?: string;
    email?: string;
  };
}

// Dynamically load Razorpay standard checkout script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const CreatorSubscriptionModal: React.FC<CreatorSubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentTier = 'free',
  initialSelectedTier,
  targetCampaignReward,
  onSuccess,
  onUpgradeSuccess
}) => {
  const { user, showToast, refreshSessionUser } = useAuth();
  const [step, setStep] = useState<'plan_selection' | 'payment_gateway' | 'payment_success'>('plan_selection');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('gold');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);

  // Payment form states
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiMode, setUpiMode] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('creator@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 8901 2345 6789');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [cardName, setCardName] = useState(user?.name || 'Creator Hub');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Success state
  const [paymentResult, setPaymentResult] = useState<{
    transactionRef: string;
    orderId: string;
    tier: SubscriptionTier;
    planName: string;
    amount: number;
    paymentMethod: string;
    paidAt: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('plan_selection');
      setLoading(false);
      setProcessingPayment(false);
      setCheckoutSession(null);
      setPaymentResult(null);

      if (initialSelectedTier && initialSelectedTier !== 'free') {
        setSelectedTier(initialSelectedTier);
      } else if (currentTier === 'free') {
        setSelectedTier('gold');
      } else if (currentTier === 'silver') {
        setSelectedTier('gold');
      } else {
        setSelectedTier('diamond');
      }
    }
  }, [isOpen, currentTier, initialSelectedTier]);

  if (!isOpen) return null;

  const handleTriggerPayment = async (tier: SubscriptionTier) => {
    if (tier === 'free') return;
    if (tier === currentTier) {
      showToast(`You are already subscribed to ${tier.toUpperCase()}!`, 'info');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order for ₹1 on server
      const orderRes = await api.createSubscriptionOrder({
        tier,
        billing_cycle: billingCycle
      });

      if (!orderRes.success || !orderRes.order_id) {
        throw new Error(orderRes.error || 'Failed to initialize subscription order.');
      }

      const scriptLoaded = await loadRazorpayScript();

      // If Razorpay live gateway is configured and script is available
      if (scriptLoaded && (window as any).Razorpay && !orderRes.is_simulated) {
        const options = {
          key: orderRes.key_id,
          amount: orderRes.amount, // 100 paise = ₹1
          currency: orderRes.currency || 'INR',
          name: `CreatorHub ${orderRes.plan_name || tier.toUpperCase()}`,
          description: `Subscription Upgrade to ${orderRes.plan_name || tier} (₹1)`,
          order_id: orderRes.order_id,
          prefill: orderRes.prefill || {
            name: user?.name || 'Creator',
            email: user?.email || 'creator@creatorhub.com'
          },
          theme: {
            color: '#9333ea'
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            setLoading(true);
            try {
              const res = await api.upgradeSubscription({
                tier,
                billing_cycle: billingCycle,
                payment_method: 'Razorpay Standard Checkout (UPI/Cards)',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });

              if (res.success) {
                setPaymentResult({
                  transactionRef: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  tier,
                  planName: orderRes.plan_name || tier.toUpperCase(),
                  amount: 1,
                  paymentMethod: 'Razorpay UPI / Cards',
                  paidAt: new Date().toLocaleTimeString()
                });
                setStep('payment_success');
                if (refreshSessionUser) await refreshSessionUser();
                if (onSuccess) onSuccess();
                if (onUpgradeSuccess) onUpgradeSuccess();
              } else {
                showToast(res.error || 'Failed to verify payment.', 'error');
              }
            } catch (verErr: any) {
              showToast(verErr.message || 'Payment verification failed.', 'error');
            } finally {
              setLoading(false);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              showToast('Payment cancelled. You can retry when ready.', 'info');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setLoading(false);
          const reason = resp.error?.description || resp.error?.reason || 'Payment declined.';
          showToast(`Payment failed: ${reason}`, 'error');
        });
        rzp.open();
      } else {
        // Test / Gateway Simulator Mode: Open Interactive Razorpay Payment Gateway
        setCheckoutSession({
          orderId: orderRes.order_id,
          tier,
          planName: orderRes.plan_name || tier.toUpperCase(),
          amount: orderRes.amount || 100,
          priceInr: orderRes.price_inr || 1,
          billingCycle,
          keyId: orderRes.key_id,
          isSimulated: Boolean(orderRes.is_simulated),
          prefill: orderRes.prefill
        });
        setStep('payment_gateway');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment initiation failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Process payment inside the interactive gateway
  const handleCompleteGatewayPayment = async () => {
    if (!checkoutSession) return;
    setProcessingPayment(true);

    try {
      // Simulate realistic bank network roundtrip (1.2s)
      await new Promise(resolve => setTimeout(resolve, 1200));

      const simulatedPaymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const readableMethod =
        paymentMethod === 'upi'
          ? `UPI (${upiMode === 'qr' ? 'QR Code' : upiId})`
          : paymentMethod === 'card'
          ? `Credit Card (${cardNumber.slice(-4)})`
          : `Netbanking (${selectedBank})`;

      const res = await api.upgradeSubscription({
        tier: checkoutSession.tier,
        billing_cycle: checkoutSession.billingCycle,
        payment_method: readableMethod,
        razorpay_order_id: checkoutSession.orderId,
        razorpay_payment_id: simulatedPaymentId,
        razorpay_signature: 'simulated_authorized_sig'
      });

      if (res.success) {
        setPaymentResult({
          transactionRef: simulatedPaymentId,
          orderId: checkoutSession.orderId,
          tier: checkoutSession.tier,
          planName: checkoutSession.planName,
          amount: checkoutSession.priceInr,
          paymentMethod: readableMethod,
          paidAt: new Date().toLocaleTimeString()
        });
        setStep('payment_success');
        showToast(`🎉 Payment of ₹${checkoutSession.priceInr} confirmed! Upgraded to ${checkoutSession.planName}.`);
        if (refreshSessionUser) await refreshSessionUser();
        if (onSuccess) onSuccess();
        if (onUpgradeSuccess) onUpgradeSuccess();
      } else {
        showToast(res.error || 'Payment failed to complete.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Payment processing error.', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const plans = [
    {
      id: 'silver' as SubscriptionTier,
      name: 'Silver Growth',
      tagline: 'Ideal for emerging creators scaling their monthly collabs',
      priceMonthly: 1,
      priceYearly: 1,
      icon: Sparkles,
      color: 'slate',
      borderClass: 'border-slate-400/40 hover:border-slate-300',
      badgeClass: 'bg-slate-700/80 text-slate-200 border-slate-500/40',
      gradientClass: 'from-slate-700 to-slate-900',
      btnClass: 'bg-slate-200 hover:bg-white text-slate-950 font-bold',
      applicationLimit: '15 Applications / mo',
      payoutAccess: 'Briefs up to ₹15,000',
      perks: [
        '15 campaign applications/month (5x free)',
        'Unlock briefs paying up to ₹15,000',
        '24h Early Access to newly published briefs',
        'Silver Verified Creator Profile Badge',
        'Priority brand application review'
      ]
    },
    {
      id: 'gold' as SubscriptionTier,
      name: 'Gold Pro',
      tagline: 'Most chosen by active influencers earning ₹30k - ₹80k/mo',
      priceMonthly: 1,
      priceYearly: 1,
      icon: Crown,
      color: 'amber',
      popular: true,
      borderClass: 'border-amber-500/60 hover:border-amber-400 ring-2 ring-amber-500/30',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      gradientClass: 'from-amber-600/30 via-yellow-600/20 to-slate-900',
      btnClass: 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:opacity-95 text-slate-950 font-black shadow-lg shadow-amber-500/25',
      applicationLimit: '40 Applications / mo',
      payoutAccess: 'Briefs up to ₹50,000',
      perks: [
        '40 campaign applications/month (13x free)',
        'Unlock high-paying campaigns up to ₹50,000',
        'AI Pitch Generator for winning proposals',
        'Top 3 ranking in Brand Creator Matchmaker',
        'Gold VIP Influencer Badge on bids',
        'Direct brand invitations & pitches spotlight'
      ]
    },
    {
      id: 'diamond' as SubscriptionTier,
      name: 'Diamond VIP',
      tagline: 'For elite & agency creators seeking maximum high-ticket deals',
      priceMonthly: 1,
      priceYearly: 1,
      icon: Gem,
      color: 'purple',
      borderClass: 'border-purple-500/50 hover:border-purple-400',
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      gradientClass: 'from-purple-900/40 via-indigo-900/30 to-slate-900',
      btnClass: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:opacity-95 text-white font-black shadow-lg shadow-purple-500/25',
      applicationLimit: 'Unlimited Applications',
      payoutAccess: 'Unlimited (₹50,000+ Megas)',
      perks: [
        'Unlimited applications every month',
        'Access to all Mega-Budget & Ambassador deals',
        '0% Platform Commission fee on all earnings',
        'Dedicated VIP Creator Success Manager',
        'Diamond Elite Verification Badge',
        'Featured Spotlight on Brand Dashboard homepage'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl flex flex-col my-8 overflow-hidden">
        
        {/* ================= STEP 1: PLAN SELECTION ================= */}
        {step === 'plan_selection' && (
          <>
            {/* Header */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border-b border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <button
                type="button"
                onClick={onClose}
                className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-w-2xl space-y-2 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black">
                  <Crown className="w-3.5 h-3.5" /> Creator Pro Membership • ₹1 Payment Required
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Upgrade Your Creator Tier for ₹1
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {targetCampaignReward
                    ? `This campaign pays ₹${targetCampaignReward.toLocaleString()}. Complete the ₹1 payment to unlock unlimited proposals and exclusive brand briefs.`
                    : 'Select a plan and pay ₹1 securely via UPI, Card, or Netbanking to immediately activate higher proposal limits and badge perks.'}
                </p>

                {/* Billing Switcher */}
                <div className="pt-2 inline-flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === 'monthly'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Monthly (₹1)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      billingCycle === 'yearly'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Yearly (₹1)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                      Best Value
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
              {plans.map(plan => {
                const Icon = plan.icon;
                const isCurrent = currentTier === plan.id;
                const isSelected = selectedTier === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedTier(plan.id)}
                    className={`rounded-3xl p-6 border transition-all flex flex-col justify-between relative cursor-pointer ${
                      plan.borderClass
                    } ${isSelected ? 'bg-slate-800/80 shadow-xl ring-2 ring-purple-500/50' : 'bg-slate-900/60 hover:bg-slate-800/40'}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                          <Icon className={`w-6 h-6 ${plan.id === 'silver' ? 'text-slate-300' : plan.id === 'gold' ? 'text-amber-400' : 'text-purple-400'}`} />
                        </div>
                        {isCurrent && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Current Plan
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-lg font-black text-white">{plan.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{plan.tagline}</p>

                      {/* Price */}
                      <div className="my-5 pb-5 border-b border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">₹1</span>
                          <span className="text-xs text-slate-400 font-bold">/ {billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                          Payment required: ₹1 only
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="space-y-2 mb-5">
                        <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 font-medium">Monthly Applications</span>
                          <span className="text-white font-extrabold">{plan.applicationLimit}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-slate-400 font-medium">Campaign Ceiling</span>
                          <span className="text-emerald-400 font-extrabold">{plan.payoutAccess}</span>
                        </div>
                      </div>

                      {/* Perks Checklist */}
                      <div className="space-y-2.5 text-xs text-slate-300">
                        <div className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                          Included Benefits:
                        </div>
                        {plan.perks.map((perk, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-tight">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pay & Upgrade CTA */}
                    <div className="pt-6 mt-6 border-t border-slate-800/80">
                      <button
                        type="button"
                        disabled={loading || isCurrent}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTriggerPayment(plan.id);
                        }}
                        className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                          plan.btnClass
                        }`}
                      >
                        {loading && selectedTier === plan.id ? (
                          <>
                            <RotateCw className="w-4 h-4 animate-spin" /> Preparing Checkout...
                          </>
                        ) : isCurrent ? (
                          'Active Plan ✓'
                        ) : (
                          <>
                            Pay ₹1 & Upgrade to {plan.name} <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footnote */}
            <div className="p-4 sm:px-8 bg-slate-950/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>Strict Payment Policy:</strong> Tier upgrades require verified ₹1 payment via Razorpay.
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Instant UPI & Card Activation • 256-Bit SSL Encrypted
              </div>
            </div>
          </>
        )}

        {/* ================= STEP 2: MANDATORY RAZORPAY PAYMENT GATEWAY ================= */}
        {step === 'payment_gateway' && checkoutSession && (
          <div className="flex flex-col">
            {/* Gateway Header */}
            <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('plan_selection')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-base tracking-tight">Razorpay Checkout</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Test Gateway
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit Secure Payment • Order: {checkoutSession.orderId}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-400">Amount Payable</div>
                <div className="text-2xl font-black text-emerald-400">₹{checkoutSession.priceInr}.00</div>
              </div>
            </div>

            {/* Order Summary Strip */}
            <div className="px-6 py-3 bg-purple-950/40 border-b border-purple-500/20 flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-slate-200 font-semibold">
                  Upgrading to: <strong>{checkoutSession.planName}</strong> ({checkoutSession.billingCycle})
                </span>
              </div>
              <span className="text-[11px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full font-bold">
                Special ₹1 Upgrade Promotion
              </span>
            </div>

            {/* Payment Method Selector & Forms */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              
              {/* Payment Methods Tabs */}
              <div className="p-6 space-y-2 bg-slate-950/40">
                <div className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                  Select Payment Method
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'upi' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">UPI / QR Code</div>
                    <div className="text-[10px] text-slate-400">Google Pay, PhonePe, Paytm, BHIM</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'card' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">Debit / Credit Card</div>
                    <div className="text-[10px] text-slate-400">Visa, Mastercard, RuPay</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${paymentMethod === 'netbanking' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold">Net Banking</div>
                    <div className="text-[10px] text-slate-400">All Major Indian Banks</div>
                  </div>
                </button>
              </div>

              {/* Payment Details Form */}
              <div className="col-span-2 p-6 sm:p-8 space-y-6">
                
                {/* --- UPI VIEW --- */}
                {paymentMethod === 'upi' && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
                      <button
                        type="button"
                        onClick={() => setUpiMode('qr')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          upiMode === 'qr' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" /> Scan UPI QR (₹1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMode('id')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          upiMode === 'id' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5" /> Enter UPI ID
                      </button>
                    </div>

                    {upiMode === 'qr' ? (
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-950/60 border border-slate-800">
                        {/* Dynamic QR SVG */}
                        <div className="relative p-3 bg-white rounded-2xl shadow-xl shrink-0">
                          <svg className="w-32 h-32" viewBox="0 0 100 100">
                            {/* SVG QR Code Pattern */}
                            <rect width="100" height="100" fill="white" />
                            {/* Corner 1 */}
                            <rect x="5" y="5" width="26" height="26" fill="#0f172a" rx="4" />
                            <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                            <rect x="13" y="13" width="10" height="10" fill="#0f172a" rx="2" />
                            {/* Corner 2 */}
                            <rect x="69" y="5" width="26" height="26" fill="#0f172a" rx="4" />
                            <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                            <rect x="77" y="13" width="10" height="10" fill="#0f172a" rx="2" />
                            {/* Corner 3 */}
                            <rect x="5" y="69" width="26" height="26" fill="#0f172a" rx="4" />
                            <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                            <rect x="13" y="77" width="10" height="10" fill="#0f172a" rx="2" />
                            {/* Center and dots */}
                            <circle cx="50" cy="50" r="10" fill="#9333ea" />
                            <rect x="36" y="15" width="6" height="6" fill="#0f172a" />
                            <rect x="46" y="25" width="8" height="6" fill="#0f172a" />
                            <rect x="15" y="42" width="8" height="8" fill="#0f172a" />
                            <rect x="70" y="45" width="10" height="6" fill="#0f172a" />
                            <rect x="42" y="70" width="8" height="8" fill="#0f172a" />
                            <rect x="70" y="70" width="14" height="14" fill="#0f172a" />
                          </svg>
                          <div className="absolute inset-x-3 top-3 h-0.5 bg-purple-500 animate-pulse shadow-sm shadow-purple-500" />
                        </div>

                        <div className="space-y-2 text-center sm:text-left">
                          <div className="text-xs font-extrabold text-white">Scan with any UPI App</div>
                          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                            Open Google Pay, PhonePe, Paytm, BHIM, or any UPI app to pay <strong>₹1.00</strong>.
                          </p>
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Google Pay</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">PhonePe</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">Paytm</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">CRED</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold text-slate-300 block mb-1.5">Enter Virtual Payment Address (UPI ID)</label>
                          <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Quick Test Handles:</span>
                          <div className="flex flex-wrap gap-2">
                            {['success@razorpay', 'creator@okhdfcbank', 'creator@paytm'].map((h) => (
                              <button
                                key={h}
                                type="button"
                                onClick={() => setUpiId(h)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* --- CARD VIEW --- */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Card Number</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4532 •••• •••• 6789"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-black bg-slate-800 text-purple-300 px-2 py-0.5 rounded">
                          VISA
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1.5">Valid Thru</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1.5">CVV / CVC</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-purple-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">Name on Card</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Creator Name"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* --- NET BANKING VIEW --- */}
                {paymentMethod === 'netbanking' && (
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-slate-300 block mb-1.5">Select Popular Indian Bank</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map(bank => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            selectedBank === bank
                              ? 'bg-purple-600/20 border-purple-500 text-white font-black shadow-md'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800/40 text-xs font-medium'
                          }`}
                        >
                          <div className="text-xs">{bank}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown & Authorize CTA */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Base Tier Subscription ({checkoutSession.planName})</span>
                    <span>₹{checkoutSession.tier === 'silver' ? '499' : checkoutSession.tier === 'gold' ? '999' : '1999'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span>Creator Launch Promo Discount</span>
                    <span>-₹{checkoutSession.tier === 'silver' ? '498' : checkoutSession.tier === 'gold' ? '998' : '1998'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-white pt-2 border-t border-slate-800/80">
                    <span>Final Amount to Debit:</span>
                    <span className="text-emerald-400 font-extrabold text-base">₹{checkoutSession.priceInr}.00</span>
                  </div>

                  <button
                    type="button"
                    disabled={processingPayment}
                    onClick={handleCompleteGatewayPayment}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {processingPayment ? (
                      <>
                        <RotateCw className="w-4 h-4 animate-spin" /> Authorizing ₹1.00 Payment with Bank...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Authorize & Pay ₹{checkoutSession.priceInr}.00 Now
                      </>
                    )}
                  </button>

                  <div className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Razorpay Trusted Escrow Architecture • Instant Activation</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PAYMENT SUCCESS RECEIPT ================= */}
        {step === 'payment_success' && paymentResult && (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1 max-w-md">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Payment Authorized & Verified ✓
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-white pt-2">
                Upgrade to {paymentResult.planName} Active!
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your payment of <strong>₹{paymentResult.amount}.00</strong> was processed successfully. All premium perks and increased application limits are active now.
              </p>
            </div>

            {/* Official Transaction Receipt Card */}
            <div className="w-full max-w-md bg-slate-950/80 rounded-2xl p-5 border border-slate-800 text-left space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span>Transaction Reference</span>
                <span className="text-purple-300 font-bold select-all">{paymentResult.transactionRef}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Order ID</span>
                <span className="text-slate-200 select-all">{paymentResult.orderId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Amount Paid</span>
                <span className="text-emerald-400 font-bold">₹{paymentResult.amount}.00 INR</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Payment Method</span>
                <span className="text-slate-200">{paymentResult.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-800">
                <span>Activated Tier</span>
                <span className="text-amber-400 font-bold uppercase">{paymentResult.tier}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-xs shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
            >
              Access {paymentResult.planName} Features on Dashboard
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
