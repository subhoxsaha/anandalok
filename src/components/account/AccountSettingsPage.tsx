import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  ShoppingBag,
  Heart,
  ShieldCheck,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  CheckCircle,
  Download,
  AlertCircle,
  Clock,
  ChevronRight,
  Package,
  Receipt,
  ExternalLink,
  Save,
  Loader2,
  ArrowRight,
  Truck,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { User, ArtisanOrder, Donation } from '../../types';
import { getOrders, getDonations, logoutFirebaseUser, setCurrentUser } from '../../lib/storage';

interface AccountSettingsPageProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  setActiveTab: (tab: string) => void;
  onOpenDonate: (causeId?: string) => void;
  onOpenAuth: () => void;
}

export const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({
  currentUser,
  onSelectUser,
  setActiveTab,
  onOpenDonate,
  onOpenAuth
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'orders' | 'donations'>('orders');

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [location, setLocation] = useState(currentUser.location || '');
  const [name, setName] = useState(currentUser.name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Live order and donation records
  const [orders, setOrders] = useState<ArtisanOrder[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    setName(currentUser.name || '');
    setPhone(currentUser.phone || '');
    setLocation(currentUser.location || '');
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser.email) return;
    const userEmailLower = currentUser.email.toLowerCase();

    // Filter user specific orders
    const allOrders = getOrders();
    const userOrders = allOrders.filter(
      (o) =>
        (o as any).customerEmail?.toLowerCase() === userEmailLower ||
        o.customerName?.toLowerCase() === currentUser.name?.toLowerCase()
    );
    setOrders(userOrders);

    // Filter user specific donations
    const allDonations = getDonations();
    const userDonations = allDonations.filter(
      (d) =>
        d.donorEmail?.toLowerCase() === userEmailLower ||
        d.donorName?.toLowerCase() === currentUser.name?.toLowerCase()
    );
    setDonations(userDonations);
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      phone: phone.trim(),
      location: location.trim(),
    };
    setCurrentUser(updatedUser);
    onSelectUser(updatedUser);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSignOut = () => {
    logoutFirebaseUser();
    setActiveTab('home');
  };

  const downloadReceipt = (donation: Donation) => {
    const receiptText = `ANANDALOK WELFARE FOUNDATION (DURGAPUR)
===================================================
OFFICIAL 80G DONATION TAX RECEIPT
===================================================
Receipt Reference: ${donation.transactionId}
Cashfree Gateway Ref: ${donation.cashfreeOrderId || 'CF_PAID'}
Date of Contribution: ${donation.date}

DONOR DETAILS:
Name: ${donation.donorName}
Email: ${donation.donorEmail}
Phone: ${donation.donorPhone || 'N/A'}
PAN Number: ${donation.panNumber || 'NOT PROVIDED'}

CONTRIBUTION SUMMARY:
Cause / Fund: ${donation.causeTitle}
Amount Paid: ₹${donation.amount.toLocaleString()}.00 INR
Payment Gateway: Cashfree Payments (Verified 256-bit SSL)

TAX EXEMPTION STATUS:
50% Tax Relief Eligible under Section 80G of Indian IT Act.
===================================================
Thank you for empowering rural women & underprivileged children!`;

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Anandalok_80G_Receipt_${donation.transactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const isGuest = !currentUser || currentUser.id === 'guest' || !currentUser.email;

  if (isGuest) {
    return (
      <div className="min-h-[70vh] bg-slate-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-lg p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto border border-amber-300">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900">Sign In to View Account Settings</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Log in to your Anandalok account to view your past artisan craft orders, donation receipts, and manage profile preferences.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-3.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-4 h-4 shrink-0"
            />
            <span>Sign In / Register Account</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="h-28 sm:h-36 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 relative p-6">
            <div className="absolute right-4 bottom-3 opacity-20 text-slate-950">
              <ShieldCheck className="w-24 h-24" />
            </div>
          </div>

          <div className="p-6 sm:p-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              <div className="flex items-end gap-4">
                <img
                  src={
                    currentUser.avatar ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={currentUser.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
                />
                <div className="space-y-1 pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900">{currentUser.name}</h1>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-300">
                      {currentUser.role === 'central_admin' ? 'Central Admin' : 'Community Member'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentUser.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Notification alert */}
            {saveSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Profile details saved successfully!</span>
              </div>
            )}

            {/* Inline Profile Edit Form */}
            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 mb-6">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Update Account Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">City / Address</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Durgapur, West Bengal"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Phone</span>
                    <span className="font-bold text-slate-800">{currentUser.phone || 'Not added'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Location</span>
                    <span className="font-bold text-slate-800">{currentUser.location || 'Durgapur, WB'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">Member Since</span>
                    <span className="font-bold text-slate-800">{currentUser.joinedDate || '2024'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b border-slate-200 space-x-6">
          <button
            onClick={() => setActiveSection('orders')}
            className={`pb-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeSection === 'orders'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>My Artisan Craft Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('donations')}
            className={`pb-3 text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
              activeSection === 'donations'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>My Donations & 80G Receipts ({donations.length})</span>
          </button>
        </div>

        {/* SECTION: MY ORDERS */}
        {activeSection === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">No Orders Placed Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  When you purchase handcrafted items made by rural women craftswomen, your orders and tracking details will appear here.
                </p>
                <button
                  onClick={() => setActiveTab('marketplace')}
                  className="inline-flex items-center gap-2 bg-[#FEDC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer mt-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Artisan Marketplace</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  // Normalize order status to 3 stages: 'Processing', 'Dispatched', 'Delivered'
                  const rawStatus = (order.status || 'pending').toLowerCase();
                  let currentStep = 1; // 1: Processing, 2: Dispatched, 3: Delivered
                  let statusLabel = 'Processing';
                  let statusBadgeClass = 'bg-amber-100 text-amber-900 border-amber-300';

                  if (rawStatus === 'shipped' || rawStatus === 'dispatched') {
                    currentStep = 2;
                    statusLabel = 'Dispatched';
                    statusBadgeClass = 'bg-indigo-100 text-indigo-900 border-indigo-300';
                  } else if (rawStatus === 'delivered') {
                    currentStep = 3;
                    statusLabel = 'Delivered';
                    statusBadgeClass = 'bg-emerald-100 text-emerald-900 border-emerald-300';
                  } else if (rawStatus === 'cancelled') {
                    currentStep = 0;
                    statusLabel = 'Cancelled';
                    statusBadgeClass = 'bg-rose-100 text-rose-900 border-rose-300';
                  }

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold text-slate-900">{order.id}</span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full border flex items-center gap-1 ${statusBadgeClass}`}>
                              {currentStep === 1 && <Clock className="w-3 h-3 text-amber-700 animate-spin" />}
                              {currentStep === 2 && <Truck className="w-3 h-3 text-indigo-700" />}
                              {currentStep === 3 && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                              {currentStep === 0 && <XCircle className="w-3 h-3 text-rose-700" />}
                              <span>{statusLabel}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Order Placed: <span className="font-semibold text-slate-700">{order.date}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs text-slate-500 block">Total Amount</span>
                          <span className="text-base font-black text-amber-900">₹{order.total.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Track Order Status Timeline Widget */}
                      {currentStep > 0 && (
                        <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                              <Truck className="w-4 h-4 text-amber-600" />
                              <span>Track Order Status</span>
                            </h4>
                            <span className="text-[10px] font-bold text-slate-500">
                              Estimated Delivery: <strong className="text-slate-800">3-5 Business Days</strong>
                            </span>
                          </div>

                          {/* Visual 3-Stage Progress Steps */}
                          <div className="relative pt-1 pb-1">
                            <div className="grid grid-cols-3 gap-2 relative z-10">
                              
                              {/* Stage 1: Processing */}
                              <div className="flex flex-col items-center text-center space-y-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                  currentStep >= 1 ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {currentStep > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
                                </div>
                                <span className={`text-[11px] font-bold ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                                  Processing
                                </span>
                                <span className="text-[9px] text-slate-400 hidden sm:block">Craft hand-packing</span>
                              </div>

                              {/* Stage 2: Dispatched */}
                              <div className="flex flex-col items-center text-center space-y-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                  currentStep >= 2 ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {currentStep > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
                                </div>
                                <span className={`text-[11px] font-bold ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                  Dispatched
                                </span>
                                <span className="text-[9px] text-slate-400 hidden sm:block">In Transit</span>
                              </div>

                              {/* Stage 3: Delivered */}
                              <div className="flex flex-col items-center text-center space-y-1">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                  currentStep >= 3 ? 'bg-emerald-600 text-white ring-2 ring-emerald-300' : 'bg-slate-200 text-slate-500'
                                }`}>
                                  {currentStep === 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                                </div>
                                <span className={`text-[11px] font-bold ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                                  Delivered
                                </span>
                                <span className="text-[9px] text-slate-400 hidden sm:block">Handed to Buyer</span>
                              </div>

                            </div>
                          </div>

                          {/* Status Stage Description Banner */}
                          <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-600 font-medium leading-relaxed">
                            {currentStep === 1 && (
                              <p className="text-amber-900">
                                📦 <strong>Processing:</strong> Your handcrafted order is being prepared and quality-checked by Bengal artisan self-help groups in Durgapur. Expected dispatch within 24 hours.
                              </p>
                            )}
                            {currentStep === 2 && (
                              <p className="text-indigo-900">
                                🚚 <strong>Dispatched:</strong> Your order has been dispatched via Artisan Express Courier. Transit tracking is active.
                              </p>
                            )}
                            {currentStep === 3 && (
                              <p className="text-emerald-900">
                                🎉 <strong>Delivered:</strong> Order delivered successfully. Thank you for empowering Bengal rural craftswomen!
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Cashfree Reference Bar */}
                      <div className="p-3 bg-violet-50/80 rounded-xl border border-violet-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-violet-700 shrink-0" />
                          <span className="font-extrabold text-violet-950">Cashfree Payments Gateway</span>
                        </div>
                        <span className="font-mono text-[11px] text-slate-600">
                          Gateway Ref: <strong className="text-slate-900">{order.cashfreeOrderId || order.cashfreePaymentId || 'CF_VERIFIED'}</strong>
                        </span>
                      </div>

                      {/* Delivery Address */}
                      <div className="text-xs text-slate-600 space-y-0.5">
                        <p className="font-bold text-slate-800">Delivery Address:</p>
                        <p className="text-slate-600">{order.customerAddress}</p>
                      </div>

                      {/* Items Purchased List */}
                      <div className="space-y-2 pt-1">
                        <h4 className="text-xs font-bold text-slate-800">Items Ordered:</h4>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50/50">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="p-3 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={item.imageUrl} alt={item.productTitle} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">{item.productTitle}</p>
                                  <p className="text-[10px] text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                              </div>
                              <span className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SECTION: MY DONATIONS */}
        {activeSection === 'donations' && (
          <div className="space-y-4">
            {donations.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Heart className="w-8 h-8 fill-amber-400" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">No Donations Recorded Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your contributions directly feed hungry children, support women empowerment, and fund social welfare projects in West Bengal.
                </p>
                <button
                  onClick={() => onOpenDonate()}
                  className="inline-flex items-center gap-2 bg-[#FEDC00] hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer mt-2"
                >
                  <Heart className="w-4 h-4 fill-slate-950" />
                  <span>Make a Contribution</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((don) => (
                  <div
                    key={don.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-slate-900">{don.transactionId}</span>
                          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            Cashfree Verified
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 mt-1">{don.causeTitle}</h3>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-slate-500 block">Contribution Amount</span>
                        <span className="text-lg font-black text-emerald-700">₹{don.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Date of Contribution</span>
                        <span className="font-bold text-slate-800">{don.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">80G Tax Relief Status</span>
                        <span className="font-bold text-emerald-800">
                          {don.panNumber ? `PAN Attached (${don.panNumber})` : 'Eligible for 50% Tax Deduction'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => downloadReceipt(don)}
                        className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Download Signed 80G Receipt</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
