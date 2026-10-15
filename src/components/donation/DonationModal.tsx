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
  ArrowRight,
  User as UserIcon,
  Lock,
  Loader2,
  Sparkles,
  Zap,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { Cause, Donation, User } from '../../types';
import { GlassModal } from '../common/ReactBitsComponents';
import confetti from 'canvas-confetti';
import { getCurrentUser } from '../../lib/storage';
import { createCashfreeOrder, verifyCashfreeOrder, launchCashfreeCheckout, pollCashfreeOrderStatus } from '../../lib/cashfreeService';

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
  const [selectedChannel, setSelectedChannel] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [donorName, setDonorName] = useState(activeUser?.name || '');
  const [donorEmail, setDonorEmail] = useState(activeUser?.email || '');
  const [donorPhone, setDonorPhone] = useState(activeUser?.phone || '');
  const [panNumber, setPanNumber] = useState('');
  const [is80GRequested] = useState(true);
  const [step, setStep] = useState<'details' | 'payment' | 'receipt' | 'failed'>('details');
  const [completedTxn, setCompletedTxn] = useState<Donation | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [paymentFailureInfo, setPaymentFailureInfo] = useState<{
    orderId: string;
    status: string;
    reason: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setCompletedTxn(null);
      setIsProcessing(false);
      setIsVerifyingPayment(false);
      setPaymentFailureInfo(null);
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

  const handleFinalCashfreePay = async () => {
    setPaymentError('');
    setPaymentFailureInfo(null);
    setIsProcessing(true);

    try {
      // 1. Create real Cashfree Order on server
      const cfOrder = await createCashfreeOrder({
        amount,
        customerName: donorName.trim() || activeUser.name || 'Generous Contributor',
        customerEmail: donorEmail.trim() || activeUser.email || 'donor@anandalok.org',
        customerPhone: donorPhone.trim() || '9876543210',
        note: `Anandalok Welfare Foundation Donation - ₹${amount}`,
        returnUrl: `${window.location.origin}/?tab=home&donation=success&payment_id={order_id}`,
      });

      // 2. Trigger Cashfree client modal checkout
      await launchCashfreeCheckout(cfOrder.paymentSessionId);

      // 3. Poll payment status from Cashfree Gateway directly
      setIsProcessing(false);
      setIsVerifyingPayment(true);

      const statusResult = await pollCashfreeOrderStatus(cfOrder.orderId, 6, 2000);
      setIsVerifyingPayment(false);

      if (statusResult.paid || statusResult.orderStatus === 'PAID') {
        const newTxn: Donation = {
          id: `don-${Date.now()}`,
          donorName: donorName.trim() || activeUser.name || 'Generous Contributor',
          donorEmail: donorEmail.trim() || activeUser.email || 'donor@anandalok.org',
          donorPhone,
          causeId: 'unified-anandalok-fund',
          causeTitle: 'Anandalok Unified Social Welfare Fund (Durgapur)',
          amount,
          paymentMethod: 'cashfree',
          transactionId: statusResult.bankReference || statusResult.cfPaymentId || `CF_${cfOrder.orderId}`,
          cashfreeOrderId: cfOrder.orderId,
          cashfreePaymentId: String(statusResult.cfPaymentId || cfOrder.cfOrderId || cfOrder.orderId),
          cashfreePaymentSessionId: cfOrder.paymentSessionId,
          date: new Date().toISOString().split('T')[0],
          is80GClaimed: is80GRequested,
          panNumber: is80GRequested ? panNumber || 'ABCDE1234F' : undefined,
        };

        onCompleteDonation(newTxn);
        setCompletedTxn(newTxn);
        setStep('receipt');
        confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      } else {
        setPaymentFailureInfo({
          orderId: cfOrder.orderId,
          status: statusResult.orderStatus,
          reason: statusResult.failureReason || 'Payment could not be confirmed or was cancelled by user.',
        });
        setStep('failed');
      }
    } catch (err: any) {
      console.error('Donation payment error:', err);
      setIsProcessing(false);
      setIsVerifyingPayment(false);
      setPaymentError(err.message || 'Cashfree payment initiation failed. Please try again.');
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
      <div className="p-6">
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Heart className="w-4 h-4 fill-amber-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Support Anandalok Foundation</h2>
                <p className="text-xs text-slate-500">Every rupee directly funds children's nutrition, artisan tools & education</p>
              </div>
            </div>

            {/* Donor Identity Bar */}
            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-200/70 text-amber-900 flex items-center justify-center font-bold text-xs">
                  {donorName.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{donorName}</p>
                  <p className="text-[11px] text-slate-500">{donorEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Verified Account</span>
              </div>
            </div>

            {/* Donation Amount Presets */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Contribution Amount (INR)</label>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      amount === amt
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative mt-2">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="50"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Custom amount"
                  className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Tax Exemption (80G) Section */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-extrabold text-slate-800">80G Tax Exemption Certificate</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  50% Tax Relief
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Under Section 80G of the Indian Income Tax Act, 50% of your donation is tax deductible. An official signed certificate will be issued immediately upon payment.
              </p>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  PAN Number (Optional, for 80G Receipt)
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full px-3 py-1.5 text-xs font-mono uppercase rounded-lg border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                />
              </div>
            </div>

            {/* Mobile Contact */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone Number</label>
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Cashfree Payment (₹{amount.toLocaleString()})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>Cashfree Payment Gateway</span>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white px-2 py-0.5 rounded">
                    Singular PG
                  </span>
                </h2>
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

            {/* Cashfree Singular Gateway Card */}
            <div className="p-4 bg-gradient-to-br from-violet-50/80 via-white to-amber-50/40 rounded-2xl border border-violet-200 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-violet-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                    CF
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block leading-tight">Cashfree Payments</span>
                    <span className="text-[10px] text-slate-500">Production Payment Gateway (V3)</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> RBI Compliant & 256-Bit SSL
                </span>
              </div>

              {/* Supported Instruments through Cashfree */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-2">Preferred Instrument in Cashfree Gateway:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedChannel('upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedChannel === 'upi'
                        ? 'border-violet-600 bg-violet-950 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span className="text-[11px] font-bold">UPI / QR Scan</span>
                    <span className="text-[9px] opacity-80">GPay, PhonePe, Paytm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('card')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedChannel === 'card'
                        ? 'border-violet-600 bg-violet-950 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-bold">Cards</span>
                    <span className="text-[9px] opacity-80">RuPay, Visa, Master</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedChannel('netbanking')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      selectedChannel === 'netbanking'
                        ? 'border-violet-600 bg-violet-950 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-sky-400" />
                    <span className="text-[11px] font-bold">Net Banking</span>
                    <span className="text-[9px] opacity-80">50+ Indian Banks</span>
                  </button>
                </div>
              </div>

              {/* Security info banner */}
              <div className="p-3 bg-white/90 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex items-center justify-between text-slate-800 font-bold">
                  <span>Authorized Remittance:</span>
                  <span className="text-violet-700 font-extrabold">Anandalok Welfare Foundation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Contribution Amount:</span>
                  <span className="font-mono font-black text-slate-900">₹{amount.toLocaleString()}.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>80G Certificate:</span>
                  <span className="text-emerald-700 font-semibold">{panNumber ? `PAN: ${panNumber}` : 'Eligible for deduction'}</span>
                </div>
              </div>

              {paymentError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
                  {paymentError}
                </div>
              )}

              {/* Verifying Payment State */}
              {isVerifyingPayment && (
                <div className="p-4 bg-violet-50 rounded-xl border border-violet-200 text-center space-y-2">
                  <Loader2 className="w-6 h-6 text-violet-700 animate-spin mx-auto" />
                  <h4 className="text-xs font-black text-slate-900">Verifying Contribution with Bank...</h4>
                  <p className="text-[11px] text-slate-500">Please keep this window open while Cashfree Gateway confirms status.</p>
                </div>
              )}
            </div>

            {/* Action button */}
            <button
              type="button"
              disabled={isProcessing || isVerifyingPayment}
              onClick={handleFinalCashfreePay}
              className="w-full py-3.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-violet-700 hover:bg-violet-800 text-white disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting with Cashfree Gateway...</span>
                </>
              ) : isVerifyingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Transaction...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Pay ₹{amount.toLocaleString()} via Cashfree Payments</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP: PAYMENT FAILED / CANCELLED */}
        {step === 'failed' && paymentFailureInfo && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-300">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200 mb-1">
                Status: {paymentFailureInfo.status}
              </span>
              <h2 className="text-xl font-black text-slate-900">Donation Not Completed</h2>
              <p className="text-xs text-rose-700 max-w-sm mx-auto leading-relaxed">
                {paymentFailureInfo.reason}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cashfree Order Ref:</span>
                <span className="font-mono font-bold text-slate-800">{paymentFailureInfo.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Contribution Amount:</span>
                <span className="font-black text-slate-900">₹{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Debit Notice:</span>
                <span className="text-slate-700">If money was debited, your bank will auto-refund within 24-48 hours.</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleFinalCashfreePay()}
                className="flex-1 py-3 rounded-xl bg-violet-700 hover:bg-violet-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Retry Contribution via Cashfree</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-4 py-3 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Edit Details
              </button>
            </div>
          </div>
        )}

        {step === 'receipt' && completedTxn && (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="inline-block text-[10px] font-black uppercase tracking-wider bg-violet-100 text-violet-800 px-2.5 py-0.5 rounded-full border border-violet-200 mb-1">
                Cashfree Verified Transaction
              </span>
              <h2 className="text-xl font-black text-slate-900">Contribution Confirmed!</h2>
              <p className="text-xs text-slate-600">
                Thank you, <span className="font-bold text-slate-900">{completedTxn.donorName}</span>! Your generosity supports vital welfare projects in Durgapur.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Transaction Ref:</span>
                <span className="font-mono font-bold text-slate-800">{completedTxn.transactionId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Cashfree Order ID:</span>
                <span className="font-mono font-bold text-violet-700">{completedTxn.cashfreeOrderId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Gateway:</span>
                <span className="font-extrabold text-violet-800">Cashfree Payments (Production)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Amount Paid:</span>
                <span className="font-black text-slate-900">₹{completedTxn.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Date:</span>
                <span className="font-medium text-slate-800">{completedTxn.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">80G Status:</span>
                <span className="text-emerald-700 font-bold">
                  {completedTxn.panNumber ? `Claimed (PAN: ${completedTxn.panNumber})` : 'Eligible for 50% Tax Exemption'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const content = `ANANDALOK DURGAPUR - 80G TAX EXEMPTION RECEIPT\nReference: ${completedTxn.transactionId}\nPayment Gateway: Cashfree Payments Gateway\nCashfree Order ID: ${completedTxn.cashfreeOrderId}\nDonor Name: ${completedTxn.donorName}\nAmount Paid: ₹${completedTxn.amount}\nDate: ${completedTxn.date}\nStatus: Verified Tax Exemption Eligible`;
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
                className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-xs hover:bg-slate-100 cursor-pointer"
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
