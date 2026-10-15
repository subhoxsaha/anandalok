import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  ShoppingBag,
  UserCheck,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  CheckCircle,
  ExternalLink,
  MessageSquareHeart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, ArtisanProduct } from '../../types';
import { AnandalokLogo } from './AnandalokLogo';
import { AnimatedDonateButton } from './AnimatedDonateButton';
import { logoutFirebaseUser } from '../../lib/storage';

export interface CartItem {
  product: ArtisanProduct;
  quantity: number;
}

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenAuth: () => void;
  onOpenDonate: (causeId?: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  cart?: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  onClearCart?: () => void;
  isCartDropdownOpen?: boolean;
  setIsCartDropdownOpen?: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onOpenDonate,
  cartCount,
  onOpenCart,
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  isCartDropdownOpen,
  setIsCartDropdownOpen
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [internalCartOpen, setInternalCartOpen] = useState(false);

  const cartDropdownOpen = isCartDropdownOpen !== undefined ? isCartDropdownOpen : internalCartOpen;
  const setCartDropdownOpen = (val: boolean) => {
    if (setIsCartDropdownOpen) {
      setIsCartDropdownOpen(val);
    }
    setInternalCartOpen(val);
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  const cartDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (cartDropdownRef.current && !cartDropdownRef.current.contains(event.target as Node)) {
        setCartDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show CMS link if user is Central Admin
  const isCMSUser = currentUser.role === 'central_admin';

  const handleNavClick = (id: string) => {
    setActiveTab(id);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-shadow duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="group cursor-pointer text-left"
          >
            <AnandalokLogo size="sm" />
          </button>

          {/* Action Buttons (Visible on both PC and mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Cart Button with Small Pop-up Dropdown Modal */}
            <div className="relative" ref={cartDropdownRef}>
              <button
                onClick={() => {
                  setCartDropdownOpen(!cartDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className={`relative p-2 rounded-full transition-all cursor-pointer border ${
                  cartDropdownOpen 
                    ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs' 
                    : 'text-slate-800 hover:bg-amber-100/60 hover:text-amber-900 border-transparent hover:border-amber-300'
                }`}
                title="View Craft Cart Menu"
              >
                <ShoppingBag className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs border border-amber-200 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Small Pop-up Cart Dropdown Modal (like Account Menu) */}
              <AnimatePresence>
                {cartDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15, type: 'spring', stiffness: 380, damping: 25 }}
                    className="absolute right-0 sm:right-0 -right-12 mt-2 w-72 sm:w-80 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200/90 p-3.5 sm:p-4 z-50 text-slate-800"
                  >
                    {/* Cart Popover Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-amber-600" />
                        <h3 className="font-black text-xs sm:text-sm text-slate-900">Your Craft Cart</h3>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                          {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <button
                        onClick={() => setCartDropdownOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Cart Items List or Empty State */}
                    {cart.length === 0 ? (
                      <div className="text-center py-6 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">Your cart is currently empty</p>
                        <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">
                          Explore handmade crafts directly empowering rural women in Bengal.
                        </p>
                        <button
                          onClick={() => {
                            setActiveTab('marketplace');
                            setCartDropdownOpen(false);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FEDC00] hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer mt-1"
                        >
                          <span>Explore Marketplace</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Scrollable Items */}
                        <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
                          {cart.map((item) => (
                            <div key={item.product.id} className="py-2.5 flex items-center gap-2.5">
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                                  {item.product.title}
                                </p>
                                <p className="text-[10px] text-slate-500 truncate">
                                  {item.product.artisanName}
                                </p>
                                <p className="text-xs font-black text-amber-900 mt-0.5">
                                  ₹{(item.product.price * item.quantity).toLocaleString()}
                                </p>
                              </div>

                              {/* Mini Quantity Controls */}
                              <div className="flex items-center gap-1 shrink-0">
                                <div className="flex items-center border border-slate-200 rounded-md bg-slate-50">
                                  <button
                                    onClick={() => onUpdateQuantity && onUpdateQuantity(item.product.id, item.quantity - 1)}
                                    className="p-1 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-5 text-center text-[11px] font-bold text-slate-900">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => onUpdateQuantity && onUpdateQuantity(item.product.id, item.quantity + 1)}
                                    className="p-1 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => onRemoveItem && onRemoveItem(item.product.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Subtotal & Action Footer */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-600">Subtotal:</span>
                            <span className="text-slate-900 font-black text-sm">₹{subtotal.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            {onClearCart && (
                              <button
                                onClick={() => {
                                  onClearCart();
                                }}
                                className="px-2.5 py-2 text-[11px] font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                              >
                                Clear
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (!currentUser || currentUser.id === 'guest' || !currentUser.email) {
                                  onOpenAuth();
                                  setCartDropdownOpen(false);
                                  return;
                                }
                                setActiveTab('cart');
                                setCartDropdownOpen(false);
                              }}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#FEDC00] hover:bg-amber-400 text-slate-950 font-black text-xs py-2 px-3 rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer text-center"
                            >
                              <span>Checkout & Pay</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Auth / Account Profile Button & Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setCartDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-slate-200/90 text-xs font-semibold text-slate-800 bg-slate-50/80 hover:border-amber-400 hover:bg-amber-50/80 transition-all cursor-pointer select-none shadow-2xs"
                title="User Account Menu"
              >
                {currentUser.id === 'guest' ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-amber-100/80 border border-amber-300/80 flex items-center justify-center text-amber-800 shrink-0">
                      <UserIcon className="w-3 h-3" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Account</span>
                  </>
                ) : (
                  <>
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                      alt={currentUser.name}
                      className="w-5 h-5 rounded-full object-cover border border-amber-300 shrink-0"
                    />
                    <span className="max-w-[50px] sm:max-w-[90px] truncate text-[11px] font-bold text-slate-900">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="hidden sm:inline-block text-[8px] bg-[#FEDC00] text-slate-950 px-1.5 py-0.2 rounded-full font-black border border-amber-300 uppercase tracking-wider">
                      {currentUser.role === 'central_admin' ? 'Admin' : 'Member'}
                    </span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 8 }}
                    transition={{ duration: 0.15, type: 'spring', stiffness: 380, damping: 25 }}
                    className="absolute right-0 mt-2 w-60 sm:w-64 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/80 p-3 sm:p-4 z-50 text-slate-800"
                  >
                    {/* User Card info header */}
                    <div className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 mb-2">
                      {currentUser.id === 'guest' ? (
                        <>
                          <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                            <UserIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-900 truncate leading-tight">Guest Supporter</p>
                            <p className="text-[10px] text-slate-500 truncate mb-1.5">Welcome to Anandalok Welfare</p>
                            <button
                              onClick={() => {
                                onOpenAuth();
                                setProfileDropdownOpen(false);
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#FEDC00] hover:bg-amber-400 text-slate-950 border border-amber-300 shadow-2xs transition-all cursor-pointer"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Sign In / Register</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100'}
                            alt={currentUser.name}
                            className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-2xs"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs text-slate-900 truncate leading-tight">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-500 truncate mb-1">{currentUser.email || 'No email attached'}</p>
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-200/60">
                              {currentUser.role === 'central_admin' ? (
                                <>
                                  <ShieldCheck className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Central Administrator</span>
                                </>
                              ) : (
                                <>
                                  <UserIcon className="w-2.5 h-2.5 text-amber-700" />
                                  <span>Welfare Supporter</span>
                                </>
                              )}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dropdown Options */}
                    <div className="space-y-1">
                      {isCMSUser && (
                        <button
                          onClick={() => {
                            setActiveTab('cms');
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition-colors cursor-pointer text-left"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-purple-600" />
                          <span>Staff CMS Portal</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setActiveTab('cart');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer text-left"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
                        <span>View Cart & Checkout ({cartCount})</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('marketplace');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
                        <span>Shop Artisan Crafts</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenDonate();
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer text-left"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>Donate / Contribute</span>
                      </button>

                      {currentUser.id === 'guest' ? (
                        <button
                          onClick={() => {
                            onOpenAuth();
                            setProfileDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-amber-950 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer text-left mt-1"
                        >
                          <UserIcon className="w-3.5 h-3.5 text-amber-700" />
                          <span>Sign In / Sign Up</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setActiveTab('account');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors cursor-pointer text-left font-bold"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-amber-700" />
                            <span>Account Settings & History</span>
                          </button>

                          <div className="h-px bg-slate-100 my-1.5" />

                          <button
                            onClick={() => {
                              logoutFirebaseUser();
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:text-rose-950 transition-colors cursor-pointer text-left"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Main Donate CTA */}
            <div className="hidden sm:block scale-90 sm:scale-100 origin-right shrink-0">
              <AnimatedDonateButton
                onClick={() => onOpenDonate()}
                variant="header"
                label="Donate"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
