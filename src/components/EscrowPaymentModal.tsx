import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Collaboration } from '../types';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  RotateCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Building,
  QrCode,
  ExternalLink,
  Check
} from 'lucide-react';

interface EscrowPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: Collaboration | null;
  onPaymentSuccess: (collabId: string) => void;
  title?: string;
  subtitle?: string;
  autoPromptApprove?: boolean;
  onApproveAfterPayment?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Dynamically load Razorpay standard checkout script
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);

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

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  isOpen,
  onClose,
  collaboration,
  onPaymentSuccess,
  title = 'Fund & Lock Escrow',
  subtitle = 'Razorpay Escrow Gateway • UPI, Cards, Netbanking',
  autoPromptApprove = false,
  onApproveAfterPayment
}) => {
  const [step, setStep] = useState<'deal_overview' | 'razorpay_gateway' | 'payment_success'>('deal_overview');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order Details from Server
  const [orderSession, setOrderSession] = useState<{
    orderId: string;
    amountInPaise: number;
    amountInInr: number;
    currency: string;
    keyId: string;
    isSimulated: boolean;
    prefill?: any;
  } | null>(null);

  // Gateway interactive payment inputs
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiMode, setUpiMode] = useState<'qr' | 'id'>('qr');
  const [upiId, setUpiId] = useState('brand@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('999');
  const [cardName, setCardName] = useState('Brand Finance Escrow');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Verified Receipt
  const [verifiedReceipt, setVerifiedReceipt] = useState<{
    paymentId: string;
    orderId: string;
    amount: number;
    paidAt: string;
    method: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('deal_overview');
      setLoading(false);
      setVerifying(false);
      setError(null);
      setOrderSession(null);
      setVerifiedReceipt(null);
      loadRazorpayScript();
    }
  }, [isOpen, collaboration]);

  if (!isOpen || !collaboration) return null;

  const agreedAmount = Number(
    collaboration.payment_amount ||
    collaboration.reward_per_creator ||
    (collaboration as any).proposed_budget ||
    5000
  );

  const deliverables =
    collaboration.campaign_deliverables ||
    (collaboration as any).deliverables_requirements ||
    ['1x Instagram Reel / Post', 'High engagement story shoutout'];

  // 1. Create order on server and launch checkout
  const handleProceedToPayment = async () => {
    setError(null);
    setLoading(true);

    try {
      const orderRes = await api.createPaymentOrder({
        collaboration_id: collaboration.id
      });

      if (!orderRes.success || !orderRes.order_id) {
        throw new Error(orderRes.error || 'Failed to initialize escrow payment order.');
      }

      const scriptLoaded = await loadRazorpayScript();

      // If Razorpay live gateway is active and script loaded
      if (scriptLoaded && window.Razorpay && !orderRes.is_simulated) {
        const options = {
          key: orderRes.key_id,
          amount: orderRes.amount,
          currency: orderRes.currency || 'INR',
          name: 'CreatorHub Escrow',
          description: `Escrow Lock for ${collaboration.campaign_title || 'Creator Campaign'}`,
          image: '/mrbeast-avatar.jpg',
          order_id: orderRes.order_id,
          prefill: orderRes.prefill || {
            name: collaboration.brand_name || 'Brand Partner',
            email: 'brand@creatorhub.com'
          },
          notes: {
            collaboration_id: collaboration.id,
            campaign_title: collaboration.campaign_title
          },
          theme: {
            color: '#9333ea'
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            await handleVerifyOnServer(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature, 'Razorpay Live Checkout');
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setError('Payment cancelled before authorization. You can retry when ready.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setLoading(false);
          const reason = resp.error?.description || resp.error?.reason || 'Payment declined by gateway.';
          setError(`Payment failed: ${reason}`);
        });
        rzp.open();
        setLoading(false);
      } else {
        // Open interactive Razorpay checkout modal
        setOrderSession({
          orderId: orderRes.order_id,
          amountInPaise: orderRes.amount || agreedAmount * 100,
          amountInInr: agreedAmount,
          currency: 'INR',
          keyId: orderRes.key_id,
          isSimulated: Boolean(orderRes.is_simulated),
          prefill: orderRes.prefill
        });
        setStep('razorpay_gateway');
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Payment checkout error:', err);
      setError(err.message || 'An unexpected error occurred while preparing checkout.');
      setLoading(false);
    }
  };

  // 2. Complete payment in interactive gateway
  const handleAuthorizeGatewayPayment = async () => {
    if (!orderSession) return;
    setVerifying(true);
    setError(null);

    try {
      // Simulate realistic banking network roundtrip (1.2s)
      await new Promise((r) => setTimeout(r, 1200));

      const simPaymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const simSignature = `sig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const methodLabel =
        paymentMethod === 'upi'
          ? (upiMode === 'qr' ? 'Razorpay UPI QR' : `Razorpay UPI (${upiId})`)
          : paymentMethod === 'card'
          ? `Razorpay Card (${cardNumber.slice(-4)})`
          : `Razorpay Netbanking (${selectedBank})`;

      await handleVerifyOnServer(orderSession.orderId, simPaymentId, simSignature, methodLabel);
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
      setVerifying(false);
    }
  };

  // 3. Server verification
  const handleVerifyOnServer = async (orderId: string, paymentId: string, signature: string, methodLabel: string) => {
    setVerifying(true);
    try {
      const verifyRes = await api.verifyPayment({
        collaboration_id: collaboration.id,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });

      if (verifyRes.success) {
        setVerifiedReceipt({
          paymentId: paymentId,
          orderId: orderId,
          amount: agreedAmount,
          paidAt: new Date().toLocaleTimeString(),
          method: methodLabel
        });
        setStep('payment_success');
        onPaymentSuccess(collaboration.id);
      } else {
        throw new Error(verifyRes.error || 'Server signature verification rejected payment.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment verification failed on server.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500">
                {subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs">
          {/* STEP 1: Deal Breakdown & Escrow Review */}
          {step === 'deal_overview' && (
            <>
              {/* Deal Breakdown Card */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex justify-between items-start pb-2 border-b border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Campaign Brief</span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {collaboration.campaign_title || 'Direct Creator Brief'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    Escrow Protection
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Brand Partner</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {collaboration.brand_name || 'Brand Profile'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Creator</span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {collaboration.creator_name || 'Creator Partner'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] mb-1">Deliverables:</span>
                  <div className="space-y-1">
                    {deliverables.slice(0, 3).map((item: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Escrow Line Items */}
              <div className="space-y-2 p-3.5 bg-purple-500/5 border border-purple-200 dark:border-purple-900/40 rounded-2xl">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Agreed Creator Compensation</span>
                  <span>₹{agreedAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300 font-semibold">
                  <span>Platform Protection & Escrow Fee</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹0 (Free)</span>
                </div>
                <div className="pt-2 border-t border-purple-200 dark:border-purple-900/50 flex justify-between items-center text-sm font-extrabold text-slate-900 dark:text-white">
                  <span>Total Escrow Deposit</span>
                  <span className="text-base text-purple-600 dark:text-purple-400">
                    ₹{agreedAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-[11px]">
                <Lock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Mandatory Escrow Guarantee:</strong> Funds are locked securely in Razorpay escrow. They are only released to the creator once you inspect and approve their submitted content.
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2 text-[11px]">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="block font-bold">Payment Error</strong>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={handleProceedToPayment}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Connecting to Razorpay...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay ₹{agreedAmount.toLocaleString()} via Razorpay</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </>
          )}

          {/* STEP 2: Interactive Razorpay Gateway Modal */}
          {step === 'razorpay_gateway' && (
            <div className="space-y-4 animate-fade-in">
              {/* Razorpay Gateway Top Brand Header */}
              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center font-black text-white text-xs">
                    R
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-white">Razorpay Secure Checkout</div>
                    <div className="text-[10px] text-slate-400">Order: {orderSession?.orderId}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-black text-emerald-400">₹{agreedAmount.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">Escrow Deposit</div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'upi'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-600 dark:text-purple-300 font-bold'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[10px]">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-600 dark:text-purple-300 font-bold'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px]">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === 'netbanking'
                      ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-600 dark:text-purple-300 font-bold'
                      : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <Building className="w-4 h-4" />
                  <span className="text-[10px]">Netbanking</span>
                </button>
              </div>

              {/* UPI Tab */}
              {paymentMethod === 'upi' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setUpiMode('qr')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${
                        upiMode === 'qr' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Scan UPI QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiMode('id')}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${
                        upiMode === 'id' ? 'bg-purple-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Enter UPI ID
                    </button>
                  </div>

                  {upiMode === 'qr' ? (
                    <div className="text-center py-2 space-y-2">
                      <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl border-2 border-purple-500 shadow-inner flex flex-col items-center justify-center relative">
                        <QrCode className="w-28 h-28 text-slate-900" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="bg-purple-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow">
                            ₹{agreedAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">
                        Scan with GPay, PhonePe, Paytm or BHIM
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400">Virtual Payment Address (UPI ID)</label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. yourname@okhdfcbank"
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Card Tab */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400">Name on Card</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Netbanking Tab */}
              {paymentMethod === 'netbanking' && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <label className="text-[10px] font-bold text-slate-400">Select Bank</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  >
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>State Bank of India</option>
                    <option>Axis Bank</option>
                    <option>Kotak Mahindra Bank</option>
                  </select>
                  <p className="text-[10px] text-slate-500">
                    You will be directed to your bank portal for 2FA OTP authorization.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-[11px]">
                  <strong>Payment Failed:</strong> {error}
                </div>
              )}

              {/* Back & Authorize Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={verifying}
                  onClick={() => setStep('deal_overview')}
                  className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={verifying}
                  onClick={handleAuthorizeGatewayPayment}
                  className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  {verifying ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      <span>Securing Escrow in Razorpay...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorize &amp; Pay ₹{agreedAmount.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Success Receipt */}
          {step === 'payment_success' && verifiedReceipt && (
            <div className="text-center py-4 space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Payment Secured in Escrow!
                </h3>
                <p className="text-slate-500 max-w-xs mx-auto text-xs">
                  ₹{verifiedReceipt.amount.toLocaleString()} has been securely deposited via Razorpay. Funds are locked in escrow and will only be released when you approve deliverables.
                </p>
              </div>

              {/* Receipt Details */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">ESCROW_LOCKED</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Razorpay Payment ID:</span>
                  <span className="text-slate-800 dark:text-slate-200">{verifiedReceipt.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Razorpay Order ID:</span>
                  <span className="text-slate-800 dark:text-slate-200">{verifiedReceipt.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="text-slate-800 dark:text-slate-200">{verifiedReceipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Secured At:</span>
                  <span className="text-slate-800 dark:text-slate-200">{verifiedReceipt.paidAt}</span>
                </div>
              </div>

              {autoPromptApprove && onApproveAfterPayment ? (
                <button
                  onClick={() => {
                    onClose();
                    onApproveAfterPayment();
                  }}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Proceed to Approve Deliverable &amp; Release Escrow</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md cursor-pointer transition-all"
                >
                  Done &amp; View Active Deal
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
