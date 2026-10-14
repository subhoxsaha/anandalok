import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Trash2, ShieldCheck, Heart, ArrowRight, CheckCircle, 
  MapPin, Plus, Minus, Truck, Sparkles, CreditCard, QrCode, Tag, ArrowLeft,
  Package, Clock, Lock, Edit2, AlertCircle, Phone, User, Mail, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ArtisanProduct, ArtisanOrder, User as UserType } from '../../types';
import confetti from 'canvas-confetti';
import { saveOrder } from '../../lib/storage';
import { processStripePayment, TEST_CARDS } from '../../lib/stripeService';

interface CartItem {
  product: ArtisanProduct;
  quantity: number;
}

interface ExtendedCheckoutPageProps {
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentUser: UserType;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const ExtendedCheckoutPage: React.FC<ExtendedCheckoutPageProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  setActiveTab,
  onOpenAuth
}) => {
  // Step tracking: 1 = Cart Review, 2 = Delivery Info, 3 = Payment, 4 = Order Placed
  const [activeStep, setActiveStep] = useState<number>(1);
  const [step1Confirmed, setStep1Confirmed] = useState<boolean>(false);
  const [step2Confirmed, setStep2Confirmed] = useState<boolean>(false);
  const [placedOrder, setPlacedOrder] = useState<ArtisanOrder | null>(null);

  // Delivery Form State
  const [customerName, setCustomerName] = useState(currentUser.name !== 'Guest Supporter' ? currentUser.name : '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(currentUser.email || '');
  const [customerAddress, setCustomerAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryError, setDeliveryError] = useState('');

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'upi' | 'cod' | 'card'>('stripe');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Stripe card states
  const [cardNumber, setCardNumber] = useState(TEST_CARDS.VISA_SUCCESS.number);
  const [cardExp, setCardExp] = useState(TEST_CARDS.VISA_SUCCESS.exp);
  const [cardCvc, setCardCvc] = useState(TEST_CARDS.VISA_SUCCESS.cvc);
  const [cardZip, setCardZip] = useState(TEST_CARDS.VISA_SUCCESS.zip);
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [stripeError, setStripeError] = useState('');

  // Pre-fill user details when currentUser changes
  useEffect(() => {
    if (currentUser.name && currentUser.name !== 'Guest Supporter') {
      setCustomerName(currentUser.name);
    }
    if (currentUser.email) {
      setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  // Calculations
  const FREE_SHIPPING_THRESHOLD = 999;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = discountApplied ? Math.round(subtotal * 0.1) : 0; // 10% discount
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeShipping ? 0 : 60);
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Coupon handler
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'ANANDALOK10' || code === 'CRAFT10') {
      setDiscountApplied(true);
      setCouponSuccess('Success! 10% discount applied to your order.');
    } else if (code) {
      setCouponError('Invalid code. Use code ANANDALOK10 for 10% off!');
    }
  };

  // Check if user is logged in
  const isGuest = !currentUser || currentUser.id === 'guest' || !currentUser.email;

  // Step 1: Proceed to Delivery Address
  const handleProceedToDelivery = () => {
    if (isGuest) {
      onOpenAuth();
      return;
    }
    if (cart.length === 0) return;
    setStep1Confirmed(true);
    setActiveStep(2);
    // Scroll to Step 2
    const elem = document.getElementById('step-2-delivery');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Step 2: Validate & Proceed to Payment
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onOpenAuth();
      return;
    }
    setDeliveryError('');

    if (!customerName.trim()) {
      setDeliveryError('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setDeliveryError('Please enter a valid 10-digit phone number');
      return;
    }
    if (!customerAddress.trim()) {
      setDeliveryError('Please enter your delivery address');
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setDeliveryError('Please enter a valid 6-digit Pincode');
      return;
    }

    setStep2Confirmed(true);
    setActiveStep(3);
    const elem = document.getElementById('step-3-payment');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Step 3: Confirm & Place Order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      onOpenAuth();
      return;
    }
    if (cart.length === 0) return;
    setStripeError('');

    const fullAddressString = `${customerAddress.trim()}${landmark ? `, Near ${landmark.trim()}` : ''}, ${city.trim()} - ${pincode.trim()}`;

    let stripePaymentIntentId: string | undefined;
    let stripeReceiptUrl: string | undefined;

    if (paymentMethod === 'stripe' || paymentMethod === 'card') {
      setIsProcessingStripe(true);
      try {
        const stripeRes = await processStripePayment(
          {
            amount: total,
            donorOrCustomerName: customerName.trim(),
            email: customerEmail.trim() || currentUser.email || 'customer@anandalok.org',
            description: `Artisan Marketplace Order - ${cart.length} craft items`
          },
          {
            cardNumber,
            expMonthYear: cardExp,
            cvc: cardCvc,
            zipCode: cardZip
          }
        );

        if (!stripeRes.success) {
          setStripeError(stripeRes.errorMessage || 'Stripe card authorization failed. Please verify credentials.');
          setIsProcessingStripe(false);
          return;
        }

        stripePaymentIntentId = stripeRes.paymentIntentId;
        stripeReceiptUrl = stripeRes.receiptUrl;
      } catch (err: any) {
        setStripeError(err.message || 'Payment failed. Please try again.');
        setIsProcessingStripe(false);
        return;
      }
      setIsProcessingStripe(false);
    }

    const newOrder: ArtisanOrder = {
      id: `ord-${Date.now()}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: fullAddressString,
      items: cart.map(item => ({
        productId: item.product.id,
        productTitle: item.product.title,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.images[0]
      })),
      subtotal,
      discount,
      deliveryFee,
      total,
      paymentMethod,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      stripePaymentIntentId,
      stripeReceiptUrl
    };

    saveOrder(newOrder);
    setPlacedOrder(newOrder);
    setActiveStep(4);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 } });
    onClearCart();

    const elem = document.getElementById('step-4-confirmation');
    if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-slate-50/80 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => setActiveTab('marketplace')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-amber-800 transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Artisan Marketplace</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block">
              Need assistance?
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300/80">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>100% Secure Checkout</span>
            </span>
          </div>
        </div>

        {/* Page Header Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-amber-600" />
            <span>Craft Cart & Extended Checkout</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Every craft purchase directly empowers rural artisans and women self-help groups in Bengal.
          </p>
        </div>

        {/* Mandatory Authentication Notice for Guest Users */}
        {isGuest && (
          <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-5 mb-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/90 shadow-2xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">Sign In Required for Shopping & Checkout</h4>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  Anandalok Welfare policy requires authentication with your Google Account before placing artisan craft orders to ensure buyer protection and track delivery status.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAuth}
              className="shrink-0 py-2.5 px-5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4 shrink-0" />
              <span>Sign In with Google</span>
            </button>
          </div>
        )}

        {/* Steps Visual Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 relative">
            
            {/* Step 1 Indicator */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              activeStep === 1 
                ? 'bg-amber-500/10 border border-amber-400 text-amber-950 font-extrabold shadow-2xs' 
                : step1Confirmed 
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                step1Confirmed 
                  ? 'bg-emerald-600 text-white' 
                  : activeStep === 1 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {step1Confirmed ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <div className="min-w-0">
                <p className="text-xs truncate font-bold">1. Review Cart</p>
                <p className="text-[10px] opacity-75 truncate">{totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}</p>
              </div>
            </div>

            {/* Step 2 Indicator */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              activeStep === 2 
                ? 'bg-amber-500/10 border border-amber-400 text-amber-950 font-extrabold shadow-2xs' 
                : step2Confirmed 
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                step2Confirmed 
                  ? 'bg-emerald-600 text-white' 
                  : activeStep === 2 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {step2Confirmed ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <div className="min-w-0">
                <p className="text-xs truncate font-bold">2. Delivery Info</p>
                <p className="text-[10px] opacity-75 truncate">{step2Confirmed ? 'Saved' : 'Address details'}</p>
              </div>
            </div>

            {/* Step 3 Indicator */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              activeStep === 3 
                ? 'bg-amber-500/10 border border-amber-400 text-amber-950 font-extrabold shadow-2xs' 
                : placedOrder 
                ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200' 
                : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                placedOrder 
                  ? 'bg-emerald-600 text-white' 
                  : activeStep === 3 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {placedOrder ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <div className="min-w-0">
                <p className="text-xs truncate font-bold">3. Payment</p>
                <p className="text-[10px] opacity-75 truncate">{placedOrder ? 'Completed' : 'UPI, COD, Card'}</p>
              </div>
            </div>

            {/* Step 4 Indicator */}
            <div className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
              activeStep === 4 
                ? 'bg-emerald-600 text-white font-extrabold shadow-md' 
                : 'bg-slate-50 text-slate-400 border border-slate-200'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                activeStep === 4 ? 'bg-white text-emerald-700' : 'bg-slate-200 text-slate-500'
              }`}>
                4
              </div>
              <div className="min-w-0">
                <p className="text-xs truncate font-bold">4. Confirmed</p>
                <p className="text-[10px] opacity-75 truncate">{activeStep === 4 ? 'Order Placed!' : 'Receipt'}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Progressive Steps 1, 2, 3, 4 (Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* STEP 1: CART ITEMS REVIEW */}
            <div 
              id="step-1-cart"
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeStep === 1 
                  ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                  : step1Confirmed 
                  ? 'border-slate-200 shadow-2xs' 
                  : 'border-slate-200 opacity-60'
              }`}
            >
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    step1Confirmed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {step1Confirmed ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : '1'}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Review Cart Items</span>
                      {cart.length > 0 && (
                        <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          {cart.length} {cart.length === 1 ? 'item' : 'items'}
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500">Verify your selected artisan crafts and quantities</p>
                  </div>
                </div>

                {step1Confirmed && activeStep !== 1 && (
                  <button
                    onClick={() => setActiveStep(1)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Items</span>
                  </button>
                )}
              </div>

              {/* Step 1 Body */}
              {(activeStep === 1 || step1Confirmed) && (
                <div className="p-4 sm:p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-10 space-y-3">
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900">Your Craft Cart is Empty</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Explore handmade terracotta, jute bags, Kantha stitch sarees, and bamboo crafts created by rural artisans.
                      </p>
                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className="inline-flex items-center gap-2 bg-[#FEDC00] hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer mt-2"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Explore Marketplace Crafts</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items List */}
                      <div className="divide-y divide-slate-100">
                        {cart.map((item) => (
                          <div key={item.product.id} className="py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4">
                            <img
                              src={item.product.images[0]}
                              alt={item.product.title}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                {item.product.category}
                              </span>
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                                {item.product.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 truncate">
                                Artisan: <span className="font-semibold text-slate-700">{item.product.artisanName}</span> ({item.product.artisanGroup})
                              </p>
                              <div className="text-xs font-black text-slate-900 sm:hidden">
                                ₹{(item.product.price * item.quantity).toLocaleString()}
                              </div>
                            </div>

                            {/* Quantity Adjuster */}
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                  className="p-1.5 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                  title="Decrease quantity"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-8 text-center text-xs font-extrabold text-slate-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1.5 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                  title="Increase quantity"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="text-right hidden sm:block w-20">
                                <span className="text-sm font-black text-slate-900 block">
                                  ₹{(item.product.price * item.quantity).toLocaleString()}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  ₹{item.product.price} each
                                </span>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Step 1 Action Button */}
                      {activeStep === 1 && (
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                          <button
                            onClick={() => setActiveTab('marketplace')}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            + Add More Crafts
                          </button>

                          <button
                            onClick={handleProceedToDelivery}
                            className="inline-flex items-center gap-2 bg-[#FEDC00] hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl border border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
                          >
                            <span>Proceed to Delivery Address</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* STEP 2: DELIVERY DETAILS */}
            <div 
              id="step-2-delivery"
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeStep === 2 
                  ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                  : step2Confirmed 
                  ? 'border-slate-200 shadow-2xs' 
                  : 'border-slate-200'
              }`}
            >
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    step2Confirmed ? 'bg-emerald-100 text-emerald-800' : activeStep === 2 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {step2Confirmed ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : '2'}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Delivery & Contact Details</span>
                      {!step1Confirmed && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500">Provide shipping address for dispatching your handcrafted items</p>
                  </div>
                </div>

                {step2Confirmed && activeStep !== 2 && (
                  <button
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Address</span>
                  </button>
                )}
              </div>

              {/* Step 2 Body: Locked vs Unlocked */}
              {!step1Confirmed ? (
                <div className="p-6 text-center bg-slate-50/50 space-y-2">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Complete Step 1 above to unlock delivery details</p>
                </div>
              ) : activeStep === 2 || step2Confirmed ? (
                <div className="p-4 sm:p-6">
                  {step2Confirmed && activeStep !== 2 ? (
                    /* Display Saved Summary */
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-1">
                      <p className="font-extrabold text-slate-900">{customerName} ({customerPhone})</p>
                      <p className="text-slate-600">{customerAddress}{landmark ? `, Near ${landmark}` : ''}, {city} - {pincode}</p>
                      {customerEmail && <p className="text-slate-500">{customerEmail}</p>}
                    </div>
                  ) : (
                    /* Display Address Form */
                    <form onSubmit={handleProceedToPayment} className="space-y-4">
                      {deliveryError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{deliveryError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              placeholder="e.g. Suman Roy"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            Phone Number * (for delivery updates)
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="tel"
                              required
                              placeholder="10-digit mobile number"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            Email Address (Optional)
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input
                              type="email"
                              placeholder="For order receipt"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            Pincode *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="6-digit postal code"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">
                          Street Address / House No. *
                        </label>
                        <div className="relative">
                          <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            placeholder="House / Flat No., Building Name, Street Name"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            City / Town *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Kolkata"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">
                            Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="Nearby school, park, or shop"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-slate-50/50"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex items-center justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-2 bg-[#FEDC00] hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm px-6 py-3 rounded-xl border border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
                        >
                          <span>Save Address & Proceed to Payment</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : null}
            </div>

            {/* STEP 3: PAYMENT & COUPON */}
            <div 
              id="step-3-payment"
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeStep === 3 
                  ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                  : placedOrder 
                  ? 'border-slate-200 shadow-2xs' 
                  : 'border-slate-200'
              }`}
            >
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black ${
                    placedOrder ? 'bg-emerald-100 text-emerald-800' : activeStep === 3 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {placedOrder ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : '3'}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Payment Method & Coupon</span>
                      {!step2Confirmed && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-500">Apply discounts and select your preferred payment option</p>
                  </div>
                </div>
              </div>

              {/* Step 3 Body */}
              {!step2Confirmed ? (
                <div className="p-6 text-center bg-slate-50/50 space-y-2">
                  <Lock className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Complete Step 2 (Delivery Address) above to unlock payment options</p>
                </div>
              ) : activeStep === 3 ? (
                <div className="p-4 sm:p-6 space-y-6">
                  
                  {/* Coupon Code Input */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-600" />
                      <span>Have a Promo or Coupon Code?</span>
                    </label>
                    
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter ANANDALOK10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        disabled={discountApplied}
                        className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none bg-white uppercase font-bold"
                      />
                      <button
                        type="submit"
                        disabled={discountApplied || !couponCode.trim()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                      >
                        {discountApplied ? 'Applied ✓' : 'Apply Code'}
                      </button>
                    </form>

                    {couponError && <p className="text-[11px] text-rose-600 font-semibold">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-emerald-600 font-bold">{couponSuccess}</p>}
                    <p className="text-[10px] text-slate-500">Use code <span className="font-bold text-amber-800">ANANDALOK10</span> to get 10% instant artisan discount!</p>
                  </div>

                  {/* Payment Selection Options */}
                  <div className="space-y-3">
                    <p className="text-xs font-extrabold text-slate-800">Select Payment Option:</p>

                    {/* Stripe Card Option */}
                    <div 
                      onClick={() => setPaymentMethod('stripe')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col gap-3 ${
                        paymentMethod === 'stripe' ? 'border-[#635BFF] bg-indigo-50/30 ring-2 ring-[#635BFF]/20 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input type="radio" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} className="mt-1 accent-[#635BFF]" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-[#635BFF]" />
                              <span>Credit / Debit Card (Powered by Stripe)</span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#635BFF] px-2 py-0.5 rounded">
                              Official Stripe
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">Secure 256-bit encrypted checkout. Visa, Mastercard, RuPay, Amex accepted worldwide.</p>
                        </div>
                      </div>

                      {/* Stripe Inline Card Elements */}
                      {paymentMethod === 'stripe' && (
                        <div className="mt-2 pt-3 border-t border-indigo-100 space-y-3 bg-white p-3.5 rounded-xl border border-indigo-200/80">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Number</label>
                            <div className="relative">
                              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                              <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                placeholder="4242 4242 4242 4242"
                                className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#635BFF] focus:outline-none bg-slate-50/50"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Expires</label>
                              <input
                                type="text"
                                value={cardExp}
                                onChange={(e) => setCardExp(e.target.value)}
                                placeholder="MM/YY"
                                className="w-full p-2 text-xs font-mono text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#635BFF] focus:outline-none bg-slate-50/50"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">CVC / CVV</label>
                              <input
                                type="text"
                                value={cardCvc}
                                onChange={(e) => setCardCvc(e.target.value)}
                                placeholder="123"
                                className="w-full p-2 text-xs font-mono text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#635BFF] focus:outline-none bg-slate-50/50"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">PIN / ZIP</label>
                              <input
                                type="text"
                                value={cardZip}
                                onChange={(e) => setCardZip(e.target.value)}
                                placeholder="PIN"
                                className="w-full p-2 text-xs font-mono text-center border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#635BFF] focus:outline-none bg-slate-50/50"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setCardNumber(TEST_CARDS.VISA_SUCCESS.number);
                                setCardExp(TEST_CARDS.VISA_SUCCESS.exp);
                                setCardCvc(TEST_CARDS.VISA_SUCCESS.cvc);
                                setCardZip(TEST_CARDS.VISA_SUCCESS.zip);
                              }}
                              className="text-[11px] font-bold text-[#635BFF] hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> Auto-fill Stripe 4242 Test Card
                            </button>
                            <span className="text-[10px] text-slate-400 font-semibold">PCI DSS Level 1 Certified</span>
                          </div>

                          {stripeError && (
                            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2 rounded-lg border border-rose-200">
                              {stripeError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* UPI Option */}
                    <div 
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-400' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-emerald-600" />
                            <span>Instant UPI / QR Code (Google Pay, PhonePe, Paytm)</span>
                          </span>
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Fastest</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">Scan simulated QR code or pay directly to anandalok@upi</p>
                      </div>
                    </div>

                    {/* COD Option */}
                    <div 
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-400' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-amber-700" />
                          <span>Cash on Delivery (COD)</span>
                        </span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pay in cash directly to the delivery person upon arrival</p>
                      </div>
                    </div>
                  </div>

                  {/* Final Action Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Direct Artisan Remittance</span>
                    </div>

                    <button
                      disabled={isProcessingStripe}
                      onClick={handlePlaceOrder}
                      className={`inline-flex items-center gap-2 font-black text-sm px-7 py-3.5 rounded-xl border shadow-md hover:shadow-lg transition-all cursor-pointer ${
                        paymentMethod === 'stripe'
                          ? 'bg-[#635BFF] hover:bg-[#5249e0] text-white border-indigo-700'
                          : 'bg-[#FEDC00] hover:bg-amber-400 text-slate-950 border-amber-300'
                      }`}
                    >
                      {isProcessingStripe ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Processing with Stripe...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>
                            {paymentMethod === 'stripe' ? 'Pay with Stripe' : 'Confirm & Place Order'} (₹{total.toLocaleString()})
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              ) : null}
            </div>

            {/* STEP 4: ORDER CONFIRMATION & RECEIPT */}
            {activeStep === 4 && placedOrder && (
              <motion.div 
                id="step-4-confirmation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border-2 border-emerald-400 shadow-xl p-6 sm:p-8 space-y-6"
              >
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                    Thank you, <span className="font-bold text-slate-900">{placedOrder.customerName}</span>! Your artisan craft order has been received and dispatch preparation is underway.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="inline-block bg-slate-100 text-slate-800 text-xs font-mono font-bold px-3 py-1 rounded-full border border-slate-300">
                      Order ID: {placedOrder.id}
                    </span>
                    {placedOrder.stripePaymentIntentId && (
                      <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-900 text-xs font-mono font-bold px-3 py-1 rounded-full border border-indigo-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#635BFF]" />
                        Stripe Txn: {placedOrder.stripePaymentIntentId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Receipt Details Box */}
                <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-xs space-y-3">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Order Date:</span>
                    <span className="font-bold text-slate-900">{placedOrder.date}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Delivery Address:</span>
                    <span className="font-bold text-slate-900 text-right max-w-xs">{placedOrder.customerAddress}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-bold text-indigo-900 uppercase">
                      {placedOrder.stripePaymentIntentId ? 'Stripe Gateway' : placedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Delivery:</span>
                    <span className="font-bold text-emerald-700">3-5 Business Days</span>
                  </div>
                </div>

                {/* Purchased Items Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-900">Purchased Items:</h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {placedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={item.imageUrl} alt={item.productTitle} className="w-10 h-10 rounded object-cover" />
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.productTitle}</p>
                            <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setActiveTab('cms')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer text-center"
                  >
                    Track Orders in Account / CMS
                  </button>
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#FEDC00] text-slate-950 border border-amber-300 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors cursor-pointer text-center"
                  >
                    Continue Shopping
                  </button>
                </div>
              </motion.div>
            )}

          </div>

          {/* Right Column: Sticky Order Summary Sidebar (Span 4) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </h3>

              {/* Free Shipping Progress Indicator */}
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60 text-xs space-y-1.5">
                {isFreeShipping ? (
                  <p className="text-emerald-800 font-bold flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>You've unlocked FREE Nationwide Shipping! 🎉</span>
                  </p>
                ) : (
                  <>
                    <p className="text-amber-900 font-semibold flex items-center justify-between">
                      <span>Free Shipping Goal</span>
                      <span>Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more</span>
                    </p>
                    <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-600 transition-all duration-300" 
                        style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon Discount (10%)</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-900">
                    {deliveryFee === 0 ? <span className="text-emerald-700">FREE</span> : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
                  <span>Total Amount</span>
                  <span className="text-amber-900">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Artisan Impact Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Artisan Empowerment Impact</span>
                </p>
                <p className="leading-relaxed">
                  100% of proceeds go directly to self-help artisan groups in rural Bengal, ensuring sustainable livelihood and women empowerment.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
