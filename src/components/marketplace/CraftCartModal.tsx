import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, ShieldCheck, Heart, ArrowRight, CheckCircle, 
  MapPin, X, Plus, Minus, Truck, Sparkles, CreditCard, QrCode, Tag, ArrowLeft,
  Package, Clock, Lock
} from 'lucide-react';
import { ArtisanProduct, ArtisanOrder, User } from '../../types';
import { GlassModal } from '../common/ReactBitsComponents';
import confetti from 'canvas-confetti';
import { saveOrder } from '../../lib/storage';

interface CartItem {
  product: ArtisanProduct;
  quantity: number;
}

interface CraftCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  currentUser?: User;
  onOpenAuth?: () => void;
}

export const CraftCartModal: React.FC<CraftCartModalProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  onOpenAuth
}) => {
  const isGuest = !currentUser || currentUser.id === 'guest' || !currentUser.email;

  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [customerName, setCustomerName] = useState(currentUser?.name !== 'Guest User' ? currentUser?.name || '' : '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 999;
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = discountApplied ? Math.round(subtotal * 0.1) : 0; // 10% discount
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryFee = subtotal === 0 ? 0 : (isFreeShipping ? 0 : 60);
  const total = subtotal - discount + deliveryFee;
  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (couponCode.trim().toUpperCase() === 'ANANDALOK10' || couponCode.trim().toUpperCase() === 'CRAFT10') {
      setDiscountApplied(true);
    } else if (couponCode.trim()) {
      setCouponError('Invalid coupon. Use code ANANDALOK10 for 10% off!');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrder: ArtisanOrder = {
      id: `ord-${Date.now()}`,
      customerName,
      customerPhone,
      customerAddress,
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
      status: 'pending'
    };

    saveOrder(newOrder);

    setStep('success');
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    onClearCart();
  };

  const resetModal = () => {
    setStep('cart');
    setDiscountApplied(false);
    setCouponCode('');
    onClose();
  };

  return (
    <GlassModal isOpen={isOpen} onClose={resetModal} maxWidth="max-w-xl">
      <div className="relative">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-300/60 flex items-center justify-center text-amber-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Artisan Craft Cart</span>
                {totalItemCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-300">
                    {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500">Supporting Rural Crafts & Empowerment</p>
            </div>
          </div>

          <button
            onClick={resetModal}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close cart"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between py-3 px-2 my-2 bg-slate-50/80 rounded-xl border border-slate-200/60 text-[11px] font-semibold text-slate-500">
          <div className={`flex items-center gap-1.5 ${step === 'cart' ? 'text-amber-900 font-extrabold' : 'text-slate-700'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'cart' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}>1</span>
            <span>Review Items</span>
          </div>
          <div className="w-6 h-px bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step === 'checkout' ? 'text-amber-900 font-extrabold' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'checkout' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'}`}>2</span>
            <span>Shipping & Payment</span>
          </div>
          <div className="w-6 h-px bg-slate-200" />
          <div className={`flex items-center gap-1.5 ${step === 'success' ? 'text-emerald-800 font-extrabold' : 'text-slate-500'}`}>
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${step === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}>3</span>
            <span>Confirmed</span>
          </div>
        </div>

        {/* STEP 1: CART VIEW */}
        {step === 'cart' && (
          <div className="space-y-4 pt-1">
            {cart.length === 0 ? (
              <div className="text-center py-12 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShoppingBag className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Your Craft Cart is Empty</h4>
                  <p className="text-slate-500 text-xs mt-1">Discover unique, handmade creations by women artisans.</p>
                </div>
                <button
                  onClick={resetModal}
                  className="mt-2 px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                  type="button"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Browse Artisan Marketplace</span>
                </button>
              </div>
            ) : (
              <>
                {/* Free Delivery Bar */}
                <div className="bg-amber-50/90 border border-amber-200 p-2.5 rounded-xl text-xs text-amber-950 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  <div className="flex-1">
                    {isFreeShipping ? (
                      <span className="font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Congratulations! You qualify for FREE Eco Delivery!
                      </span>
                    ) : (
                      <span>
                        Add <strong className="font-bold text-amber-900">₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()}</strong> more for FREE Delivery!
                      </span>
                    )}
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1 space-y-3">
                  {cart.map((item) => (
                    <div key={item.product.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.title}
                          className="w-14 h-14 rounded-xl object-cover border border-amber-200/80 shrink-0 shadow-2xs"
                        />
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="font-bold text-slate-900 line-clamp-1 text-xs">{item.product.title}</h4>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <span>Artisan:</span>
                            <span className="font-semibold text-amber-900">{item.product.artisanName}</span>
                          </p>
                          <p className="font-black text-slate-900 text-xs">
                            ₹{item.product.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer font-bold"
                            title="Decrease quantity"
                            type="button"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 font-bold text-slate-900 text-xs">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer font-bold"
                            title="Increase quantity"
                            type="button"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Item Total & Remove */}
                        <div className="text-right">
                          <p className="font-black text-amber-900 text-xs">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer inline-flex items-center gap-0.5 text-[10px]"
                            title="Remove item"
                            type="button"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Coupon Bar */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2 pt-1">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. ANANDALOK10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={discountApplied}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500 uppercase font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={discountApplied || !couponCode.trim()}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 disabled:opacity-50 text-amber-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    {discountApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </form>

                {couponError && (
                  <p className="text-[10px] text-rose-600 font-bold px-1 select-none">
                    {couponError}
                  </p>
                )}

                {/* Order Cost Breakdown */}
                <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({totalItemCount} items)</span>
                    <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {discountApplied && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Artisan Discount (10%)</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-600">
                    <span>Eco Packaging & Courier</span>
                    {deliveryFee === 0 ? (
                      <span className="font-bold text-emerald-700">FREE</span>
                    ) : (
                      <span className="font-bold text-slate-900">₹{deliveryFee}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Payable</span>
                    <span className="text-amber-900">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Social Impact Callout */}
                <div className="p-2.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600 shrink-0" />
                  <span>
                    100% of marketplace proceeds directly pay fair wages to West Bengal village artisans.
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (isGuest) {
                      onClose();
                      if (onOpenAuth) onOpenAuth();
                      return;
                    }
                    setStep('checkout');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  type="button"
                >
                  {isGuest ? (
                    <>
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Sign In with Google to Checkout</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Shipping & Delivery</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP 2: CHECKOUT & ADDRESS */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="space-y-3 text-xs pt-1">
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Cart</span>
              </button>
              <span className="text-slate-500 font-semibold text-[11px]">Amount Payable: <strong className="text-slate-900 font-extrabold">₹{total.toLocaleString()}</strong></span>
            </div>

            <div className="space-y-2.5 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Shipping Address</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 text-[11px]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Your Full Name"
                    className="w-full mt-1 p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 text-[11px]">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full mt-1 p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 text-[11px]">Delivery Address *</label>
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="House/Flat No., Building, Street, City, Pincode"
                  className="w-full mt-1 p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/80">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                <span>Select Payment Option</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${paymentMethod === 'upi' ? 'border-amber-600 bg-amber-50/90 text-amber-950 font-bold' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  <QrCode className="w-4 h-4 text-amber-800" />
                  <span className="text-[10px]">UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${paymentMethod === 'cod' ? 'border-amber-600 bg-amber-50/90 text-amber-950 font-bold' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  <Truck className="w-4 h-4 text-amber-800" />
                  <span className="text-[10px]">Cash on Delivery</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1 ${paymentMethod === 'card' ? 'border-amber-600 bg-amber-50/90 text-amber-950 font-bold' : 'border-slate-200 bg-white text-slate-700'}`}
                >
                  <CreditCard className="w-4 h-4 text-amber-800" />
                  <span className="text-[10px]">Net Banking / Card</span>
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-medium flex items-center gap-2 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Secure Checkout & Fair Wage Guarantee to Artisans</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Confirm & Place Order (₹{total.toLocaleString()})</span>
              <CheckCircle className="w-4 h-4 text-amber-400" />
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="text-center space-y-4 py-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider">Order Confirmed</span>
              <h3 className="text-xl font-black text-slate-900">Thank You for Supporting Local Artisans!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto pt-1">
                Your order is being carefully packed by the Bengal Rural Women Cooperative. A tracking confirmation SMS will be sent to <strong className="text-slate-800">{customerPhone || 'your phone number'}</strong>.
              </p>
            </div>

            {/* Delivery Info Box */}
            <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 text-left text-xs max-w-md mx-auto space-y-2">
              <div className="flex items-center justify-between text-slate-700 font-semibold border-b border-amber-200/60 pb-1.5">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <Package className="w-4 h-4" /> Order Ref: #AND-{Math.floor(100000 + Math.random() * 900000)}
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> 3-5 Business Days
                </span>
              </div>
              {customerName && (
                <p className="text-[11px] text-slate-600">
                  <strong>Deliver To:</strong> {customerName}, {customerAddress}
                </p>
              )}
            </div>

            <button
              onClick={resetModal}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
              type="button"
            >
              <span>Continue Shopping & Supporting</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </GlassModal>
  );
};

