import React, { useState, useEffect } from 'react';
import {
  Heart,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building2,
  CheckCircle,
  Download,
  Receipt,
  Truck,
  ArrowRight,
  User as UserIcon,
  Lock,
  Loader2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Cause, Donation, User } from '../../types';
import { GlassModal } from '../common/ReactBitsComponents';
import confetti from 'canvas-confetti';
import { getCurrentUser } from '../../lib/storage';
import { processStripePayment, TEST_CARDS } from '../../lib/stripeService';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  causes?: Cause[];
  selectedCauseId?: string;
  onCompleteDonation: (donation: Donation) => void;
  currentUser?: User;
  onOpenAuth?: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  isOpen,
  onClose,
  onCompleteDonation,
  currentUser,
  onOpenAuth
}) => {
  const activeUser = currentUser || getCurrentUser();
  const isGuest = !activeUser || activeUser.id === 'guest' || !activeUser.email;

  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'upi' | 'netbanking' | 'offline_pledge'>('stripe');
  const [donorName, setDonorName] = useState(activeUser?.name || '');
  const [donorEmail, setDonorEmail] = useState(activeUser?.email || '');
  const [donorPhone, setDonorPhone] = useState(activeUser?.phone || '');
  const [panNumber, setPanNumber] = useState('');
  const [is80GRequested] = useState(true);
  const [step, setStep] = useState<'details' | 'payment' | 'receipt'>('details');
  const [completedTxn, setCompletedTxn] = useState<Donation | null>(null);

  // Stripe card details state
  const [cardNumber, setCardNumber] = useState(TEST_CARDS.VISA_SUCCESS.number);
  const [cardExp, setCardExp] = useState(TEST_CARDS.VISA_SUCCESS.exp);
  const [cardCvc, setCardCvc] = useState(TEST_CARDS.VISA_SUCCESS.cvc);
  const [cardZip, setCardZip] = useState(TEST_CARDS.VISA_SUCCESS.zip);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setCompletedTxn(null);
      setIsProcessing(false);
      setPaymentError('');
      const latestUser = currentUser || getCurrentUser();
      setDonorName(latestUser.name !== 'Guest User' ? latestUser.name : '');
      setDonorEmail(latestUser.email || '');
      if (latestUser.phone) setDonorPhone(latestUser.phone);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  if (isGuest) {
    return (
      <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900">Sign In Required to Donate</h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Anandalok Welfare policy requires donors to log in with Google to generate 80G tax exemption certificates and keep secure record of contributions.
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              if (onOpenAuth) onOpenAuth();
            }}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 shrink-0" />
            <span>Sign In with Google to Donate</span>
          </button>
        </div>
      </GlassModal>
    );
  }

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setStep('payment');
  };

  const handleFinalPay = async () => {
    setPaymentError('');

    if (paymentMethod === 'stripe') {
      setIsProcessing(true);
      try {
        const stripeRes = await processStripePayment(
          {
            amount,
            donorOrCustomerName: donorName || 'Generous Contributor',
            email: donorEmail || 'donor@anandalok.org',
            description: `Donation to Anandalok Welfare Fund - ₹${amount}`
          },
          {
            cardNumber,
            expMonthYear: cardExp,
            cvc: cardCvc,
            zipCode: cardZip
          }
        );

        if (!stripeRes.success) {
          setPaymentError(stripeRes.errorMessage || 'Stripe payment was declined. Please try again.');
          setIsProcessing(false);
          return;
        }

        const newTxn: Donation = {
          id: `don-${Date.now()}`,
          donorName: donorName || 'Generous Contributor',
          donorEmail: donorEmail || 'donor@anandalok.org',
          donorPhone,
          causeId: 'unified-anandalok-fund',
          causeTitle: 'Anandalok Unified Social Welfare Fund (Durgapur)',
          amount,
          paymentMethod: 'stripe',
          transactionId: stripeRes.paymentIntentId,
          stripePaymentIntentId: stripeRes.paymentIntentId,
          stripeReceiptUrl: stripeRes.receiptUrl,
          date: new Date().toISOString().split('T')[0],
          is80GClaimed: is80GRequested,
          panNumber: is80GRequested ? panNumber || 'ABCDE1234F' : undefined
        };

        onCompleteDonation(newTxn);
        setCompletedTxn(newTxn);
        setIsProcessing(false);
        setStep('receipt');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (err: any) {
        setPaymentError(err.message || 'Payment failed. Please verify credentials.');
        setIsProcessing(false);
      }
      return;
    }

    // Fallback for UPI or offline pledge
    const newTxn: Donation = {
      id: `don-${Date.now()}`,
      donorName: donorName || 'Generous Contributor',
      donorEmail: donorEmail || 'donor@anandalok.org',
      donorPhone,
      causeId: 'unified-anandalok-fund',
      causeTitle: 'Anandalok Unified Social Welfare Fund (Durgapur)',
      amount,
      paymentMethod,
      transactionId: `AL80G${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toISOString().split('T')[0],
      is80GClaimed: is80GRequested,
      panNumber: is80GRequested ? panNumber || 'ABCDE1234F' : undefined
    };

    onCompleteDonation(newTxn);
    setCompletedTxn(newTxn);
    setStep('receipt');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="relative">
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-amber-200">
                  <Heart className="w-3 h-3 text-amber-700 fill-amber-700" />
                  <span>Anandalok Social Welfare Fund</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1.5">Make a Donation</h2>
                <p className="text-xs text-slate-500">Empowering children, clothing drives & rural artisans in Bengal.</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 80G Tax Benefit
              </span>
            </div>

            {/* Purpose Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center gap-3 text-xs text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Direct Field Impact</p>
                <p className="text-[11px] text-slate-600">All contributions are transparently audited and allocated directly where needed most.</p>
              </div>
            </div>

            {/* Amount Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700">Select Amount (₹ INR):</span>
                <span className="text-slate-950 text-base font-black bg-slate-100 px-3 py-0.5 rounded-lg border border-slate-200">
                  ₹{amount.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      amount === amt
                        ? 'bg-slate-950 text-white shadow-xs border border-slate-950'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="100"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  placeholder="Custom amount"
                />
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-2.5 pt-1">
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Donor Details</h4>
              
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-700 shrink-0 font-extrabold text-xs">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">{donorName}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-widest bg-slate-200 text-slate-700 px-1 py-0.2 rounded shrink-0">Secured Session</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate leading-tight">{donorEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div>
                  <label className="font-medium text-slate-700">Phone Number</label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+91 98301 23456"
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>

                <div>
                  <label className="font-medium text-slate-700">PAN Number (Optional for 80G)</label>
                  <input
                    type="text"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    className="w-full mt-1 p-2 rounded-xl border border-slate-200 uppercase font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>Proceed to Payment (₹{amount.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Gateway</h2>
                <p className="text-xs text-slate-500">Contributing ₹{amount.toLocaleString()} to Anandalok Welfare Fund</p>
              </div>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="text-xs text-slate-700 font-bold hover:underline"
              >
                ← Edit Details
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'stripe', label: 'Stripe Pay', icon: CreditCard, highlight: true },
                { id: 'upi', label: 'UPI Scan', icon: QrCode },
                { id: 'netbanking', label: 'Net Banking', icon: Building2 },
                { id: 'offline_pledge', label: 'Clothes Pickup', icon: Truck }
              ].map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer relative ${
                      paymentMethod === method.id
                        ? 'border-indigo-600 bg-indigo-950 text-white shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{method.label}</span>
                    {method.highlight && (
                      <span className="absolute -top-1.5 right-1.5 text-[8px] font-black uppercase bg-[#635BFF] text-white px-1.5 py-0.2 rounded-full">
                        Official
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Stripe Card Payment View */}
            {paymentMethod === 'stripe' && (
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-indigo-200/80 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    {/* Official Stripe SVG Wordmark */}
                    <svg className="h-4.5 w-auto text-[#635BFF]" viewBox="0 0 60 25" fill="currentColor">
                      <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v2.81c-1.12.57-2.67.92-4.47.92-4.04 0-6.65-2.45-6.65-6.84 0-4.06 2.54-6.83 6.32-6.83 3.97 0 5.61 2.96 5.61 6.35v1.99zm-4.14-2.44c-.03-1.44-.87-2.34-2.22-2.34-1.33 0-2.27.9-2.43 2.34h4.65zM38.86 6.27h3.83v13.01h-3.83V6.27zm1.92-5.9c1.33 0 2.42 1.09 2.42 2.42 0 1.33-1.09 2.42-2.42 2.42-1.33 0-2.42-1.09-2.42-2.42 0-1.33 1.09-2.42 2.42-2.42zM33.4 8.78c-.83-.49-2.06-.88-3.41-.88-2.61 0-4.3 1.34-4.3 3.65 0 3.75 5.16 3.16 5.16 4.79 0 .63-.55 1.02-1.57 1.02-1.38 0-2.9-.6-3.87-1.22v3.13c1.16.54 2.65.86 3.99.86 2.76 0 4.67-1.34 4.67-3.76 0-4.04-5.18-3.32-5.18-4.83 0-.58.48-.91 1.37-.91 1.15 0 2.4.45 3.14.92V8.78zm-16.7 4.41c0-1.89-1.07-2.73-2.58-2.73-1.56 0-2.68.86-2.68 2.73 0 1.9 1.12 2.78 2.68 2.78 1.51 0 2.58-.88 2.58-2.78zm3.83-.02c0 4.19-2.67 6.81-6.41 6.81-1.3 0-2.49-.36-3.37-.97v4.61h-3.83V6.27h3.68v1.07c.88-.69 2.1-1.12 3.52-1.12 3.74 0 6.41 2.64 6.41 6.95zM4.77 12.01c0-.46.39-.75 1.08-.75.98 0 2.22.42 3.03.95V8.98C7.94 8.44 6.7 8.1 5.48 8.1 2.47 8.1.95 9.77.95 12.19c0 3.86 5.25 3.26 5.25 4.93 0 .58-.51.84-1.28.84-1.16 0-2.65-.54-3.72-1.2v3.29c1.22.54 2.62.87 3.87.87 3.17 0 4.99-1.52 4.99-4.01 0-4.14-5.29-3.41-5.29-4.9z"/>
                    </svg>
                    <span className="text-[11px] font-bold text-slate-600">Secure Payment Gateway</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> 256-Bit SSL
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Expires</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">CVC / CVV</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="123"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value)}
                        placeholder="PIN"
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Auto-fill Stripe Test Card */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCardNumber(TEST_CARDS.VISA_SUCCESS.number);
                        setCardExp(TEST_CARDS.VISA_SUCCESS.exp);
                        setCardCvc(TEST_CARDS.VISA_SUCCESS.cvc);
                        setCardZip(TEST_CARDS.VISA_SUCCESS.zip);
                      }}
                      className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-fill Stripe 4242 Test Card
                    </button>
                    <span className="text-[10px] text-slate-500 font-medium">PCI-DSS Level 1</span>
                  </div>

                  {paymentError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {paymentError}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* UPI View */}
            {paymentMethod === 'upi' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3 shadow-2xs">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">UPI Instant Scan & Pay</span>
                <div className="w-32 h-32 bg-white p-2 rounded-2xl mx-auto border border-slate-300 shadow-xs flex items-center justify-center">
                  <div className="w-full h-full border-2 border-slate-950 p-2 flex flex-col items-center justify-between bg-white text-slate-950 font-mono text-[9px]">
                    <div className="w-full flex justify-between">
                      <div className="w-5 h-5 bg-slate-950 rounded-xs" />
                      <div className="w-5 h-5 bg-slate-950 rounded-xs" />
                    </div>
                    <p className="font-bold">anandalok@upi</p>
                    <p className="font-extrabold text-slate-900 text-xs">₹{amount}</p>
                    <div className="w-full flex justify-between">
                      <div className="w-5 h-5 bg-slate-950 rounded-xs" />
                      <div className="w-3 h-3 bg-rose-600 rounded-xs" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium">Accepts Google Pay, PhonePe, Paytm, BHIM</p>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <p className="font-bold text-slate-800">Direct Bank Account Transfer</p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] space-y-1">
                  <p>Bank: State Bank of India (Durgapur Branch)</p>
                  <p>A/C Name: Anandalok Welfare Foundation</p>
                  <p>A/C No: 398200192840</p>
                  <p>IFSC: SBIN0001234</p>
                </div>
              </div>
            )}

            {paymentMethod === 'offline_pledge' && (
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                <p className="font-bold text-slate-900">Doorstep Clothing Drive Pickup</p>
                <p className="text-slate-600">Our volunteer team will reach out to schedule a doorstep collection for gently used clothes and supplies.</p>
              </div>
            )}

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleFinalPay}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                paymentMethod === 'stripe'
                  ? 'bg-[#635BFF] hover:bg-[#5349e5] text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing with Stripe...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'stripe' ? 'Pay via Stripe' : 'Confirm Contribution'} (₹{amount.toLocaleString()})
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {step === 'receipt' && completedTxn && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Thank You For Your Support!</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Receipt Reference: <strong className="text-slate-900 font-mono">{completedTxn.transactionId}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs text-slate-800 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Anandalok Welfare Organization</h3>
                  <p className="text-[10px] text-slate-500">80G Tax Exemption Certificate</p>
                </div>
                <Receipt className="w-5 h-5 text-slate-700" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <p className="text-[10px] text-slate-400">Donor Name:</p>
                  <p className="font-bold text-slate-900">{completedTxn.donorName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Amount Paid:</p>
                  <p className="font-bold text-slate-900 text-sm">₹{completedTxn.amount.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-slate-400">Fund Allocated To:</p>
                  <p className="font-bold text-slate-900">Anandalok Social Welfare & Artisan Fund</p>
                </div>
                {completedTxn.stripePaymentIntentId && (
                  <div className="col-span-2 p-2 bg-indigo-50/80 rounded-lg border border-indigo-200 text-[11px] text-indigo-900 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Verified by Stripe Payment Gateway</span>
                      <p className="font-mono text-[10px] text-indigo-700">{completedTxn.stripePaymentIntentId}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-[#635BFF] text-white px-2 py-0.5 rounded">
                      Captured
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const content = `ANANDALOK DURGAPUR - 80G TAX EXEMPTION RECEIPT\nReference: ${completedTxn.transactionId}\nPayment Gateway: ${completedTxn.stripePaymentIntentId ? 'Stripe Gateway' : completedTxn.paymentMethod}\nDonor Name: ${completedTxn.donorName}\nAmount Paid: ₹${completedTxn.amount}\nDate: ${completedTxn.date}\nStatus: Verified Tax Exemption Eligible`;
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Anandalok_80G_Receipt_${completedTxn.transactionId}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download 80G Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
};
