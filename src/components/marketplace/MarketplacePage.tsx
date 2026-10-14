import React, { useState } from 'react';
import { 
  ShoppingBag, Star, Heart, ShieldCheck, MapPin, Sparkles, 
  Check, Info, ArrowLeft, Share2, Copy, CheckCircle2, MessageCircle, 
  ExternalLink, Truck, Clock, Layers, Plus, Minus, Search, Filter, ArrowUpDown,
  ThumbsUp, Send, MessageSquare, UserCheck, Lock
} from 'lucide-react';
import { ArtisanProduct } from '../../types';
import { SpotlightCard } from '../common/ReactBitsComponents';

interface MarketplacePageProps {
  products: ArtisanProduct[];
  onAddToCart: (product: ArtisanProduct, quantity?: number) => void;
  selectedProduct: ArtisanProduct | null;
  setSelectedProduct: (product: ArtisanProduct | null) => void;
  onOpenDonate: () => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  products,
  onAddToCart,
  selectedProduct,
  setSelectedProduct,
  onOpenDonate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  
  // Detail View State
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Community Feedback & Verified Reviews State
  const [reviewsMap, setReviewsMap] = useState<Record<string, {
    id: string;
    author: string;
    avatar?: string;
    rating: number;
    date: string;
    comment: string;
    verifiedBuyer: boolean;
    helpfulCount: number;
  }[]>>({
    p1: [
      {
        id: 'r1',
        author: 'Ananya Roy',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
        rating: 5,
        date: 'Aug 04, 2026',
        comment: 'Exquisite Kantha stitch work! The thread colors are vibrant and texture is super soft. Knowing this empowers women artisans in Birbhum makes it even more special.',
        verifiedBuyer: true,
        helpfulCount: 12
      },
      {
        id: 'r2',
        author: 'Vikram Sengupta',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
        rating: 5,
        date: 'Jul 28, 2026',
        comment: 'Packed securely and delivered on time in Howrah. Outstanding quality and authentic craftsmanship!',
        verifiedBuyer: true,
        helpfulCount: 8
      }
    ],
    p2: [
      {
        id: 'r3',
        author: 'Priya Mukherjee',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120',
        rating: 5,
        date: 'Aug 01, 2026',
        comment: 'The terracotta finish is pristine! Adds such an authentic heritage vibe to our living room.',
        verifiedBuyer: true,
        helpfulCount: 15
      }
    ]
  });

  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newReviewerName, setNewReviewerName] = useState<string>('');
  const [newReviewComment, setNewReviewComment] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  const handleAddHelpful = (productId: string, reviewId: string) => {
    setReviewsMap(prev => {
      const current = prev[productId] || [];
      return {
        ...prev,
        [productId]: current.map(r => r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r)
      };
    });
  };

  const handleAddReview = (productId: string) => {
    if (!newReviewComment.trim()) return;
    const newEntry = {
      id: `r-${Date.now()}`,
      author: newReviewerName.trim() || 'Verified Buyer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120',
      rating: newRating,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      comment: newReviewComment.trim(),
      verifiedBuyer: true,
      helpfulCount: 0
    };

    setReviewsMap(prev => ({
      ...prev,
      [productId]: [newEntry, ...(prev[productId] || [])]
    }));

    setNewReviewComment('');
    setNewReviewerName('');
    setReviewSubmitted(true);
    setShowReviewForm(false);
    setTimeout(() => setReviewSubmitted(false), 4500);
  };

  const categories = [
    { id: 'all', label: 'All Crafts' },
    { id: 'textiles', label: 'Handloom & Kantha Textiles' },
    { id: 'pottery', label: 'Terracotta & Clay Art' },
    { id: 'jute_crafts', label: 'Golden Jute Eco Crafts' },
    { id: 'bamboo_wood', label: 'Bamboo & Wooden Decor' },
    { id: 'jewelry', label: 'Tribal & Brass Jewelry' }
  ];

  // Filtering
  let filtered = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artisanLocation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Sorting
  if (sortBy === 'price_low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // Share handlers
  const getProductShareUrl = (product: ArtisanProduct) => {
    return `${window.location.origin}?tab=marketplace&product=${product.id}`;
  };

  const handleCopyLink = (product: ArtisanProduct) => {
    const url = getProductShareUrl(product);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleNativeShare = async (product: ArtisanProduct) => {
    const shareData = {
      title: `${product.title} - Anandalok Rural Artisans`,
      text: `Check out this authentic handcrafted ${product.title} made by village artisan ${product.artisanName} in West Bengal!`,
      url: getProductShareUrl(product)
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleCopyLink(product);
    }
  };

  const handleWhatsAppShare = (product: ArtisanProduct) => {
    const text = encodeURIComponent(
      `*${product.title}* - Handcrafted by ${product.artisanName} (${product.artisanLocation})\n\nSupporting West Bengal women artisans. View item: ${getProductShareUrl(product)}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleFacebookShare = (product: ArtisanProduct) => {
    const url = encodeURIComponent(getProductShareUrl(product));
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  // If a product is selected, render the INSIDE SECTION view instead of grid
  if (selectedProduct) {
    const images = selectedProduct.images.length > 0 ? selectedProduct.images : ['https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?auto=format&fit=crop&q=80&w=800'];
    const currentImg = images[activeImageIdx] || images[0];
    const relatedProducts = products.filter(p => p.id !== selectedProduct.id && p.category === selectedProduct.category).slice(0, 4);

    return (
      <div className="py-6 sm:py-8 bg-transparent min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Flat Top Navigation & Action Header */}
          <div className="pb-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                setSelectedProduct(null);
                setActiveImageIdx(0);
                setQuantity(1);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs transition-colors cursor-pointer border border-slate-200/40"
              type="button"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to All Crafts</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase bg-amber-50 text-amber-800 px-3 py-1 rounded-md border border-amber-200/60 mr-1">
                {selectedProduct.category.replace('_', ' ')}
              </span>

              <button
                onClick={() => handleCopyLink(selectedProduct)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold hover:bg-slate-50 cursor-pointer"
                type="button"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() => handleWhatsAppShare(selectedProduct)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold hover:bg-emerald-100/80 cursor-pointer"
                type="button"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* FLAT EDITORIAL PRODUCT DETAILS & ARTISAN PROFILE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 pt-2">
            
            {/* Left 6 Columns: Image Gallery & Artisan Showcase */}
            <div className="lg:col-span-6 space-y-5">
              {/* Main Image Stage */}
              <div className="relative h-80 sm:h-[420px] rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group">
                <img
                  src={currentImg}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />
                
                {selectedProduct.originalPrice && (
                  <span className="absolute top-4 left-4 bg-slate-950/55 backdrop-blur-md text-amber-300 font-black text-[10px] tracking-wider px-3 py-1 rounded-full border border-white/30 shadow-xs uppercase">
                    {Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF
                  </span>
                )}

                <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Authentic Handcrafted</span>
                </div>
              </div>

              {/* Thumbnail Bar */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto w-full max-w-full overscroll-x-contain pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(idx)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImageIdx === idx ? 'border-amber-800 scale-102 shadow-2xs' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                      type="button"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Artisan Profile Showcase Card */}
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/20">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">{selectedProduct.artisanName}</h4>
                    <p className="text-[10px] text-amber-950 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-700" />
                      <span>{selectedProduct.artisanLocation}</span>
                    </p>
                  </div>

                  <span className="text-[10px] text-emerald-800 font-bold">100% Fair Wage Direct</span>
                </div>
              </div>
            </div>

            {/* Right 6 Columns: Product Meta, Pricing, Purchase Options */}
            <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Title & Rating */}
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 font-medium mb-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(true);
                        document.getElementById('feedback-reviews-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="inline-flex items-center gap-1.5 text-amber-900 bg-amber-50 hover:bg-amber-100/90 px-2.5 py-1 rounded-full border border-amber-200/80 transition-all cursor-pointer shadow-2xs font-bold text-xs"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                      <span className="font-black text-slate-900">{selectedProduct.rating}</span>
                      <span className="text-amber-800 font-semibold">
                        ({(reviewsMap[selectedProduct.id] || []).length || selectedProduct.reviewsCount} Product Reviews)
                      </span>
                    </button>
                    <span className="text-slate-400 font-mono text-[10px]">ID: #{selectedProduct.id}</span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    {selectedProduct.title}
                  </h1>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 py-2 border-b border-slate-100">
                  <span className="text-xl sm:text-2xl font-black text-slate-900">₹{selectedProduct.price.toLocaleString()}</span>
                  {selectedProduct.originalPrice && (
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                      ₹{selectedProduct.originalPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/50 ml-auto">
                    In Stock
                  </span>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Heritage & Techniques</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedProduct.description}
                  </p>
                </div>

                {/* Specifications List */}
                <div className="space-y-2 text-xs border-y border-slate-100 py-3">
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Eco Materials:</span>
                    <span className="font-bold text-slate-800">{selectedProduct.materials.join(', ')}</span>
                  </div>
                  {selectedProduct.dimensions && (
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-500 font-medium">Dimensions:</span>
                      <span className="font-bold text-slate-800">{selectedProduct.dimensions}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-0.5">
                    <span className="text-slate-500 font-medium">Heritage Region:</span>
                    <span className="font-bold text-amber-900">{selectedProduct.artisanLocation}</span>
                  </div>
                </div>

                {/* Impact Guarantee Box */}
                <div className="p-3 bg-emerald-50/20 border border-emerald-100 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-900">Empowerment Guarantee</h5>
                    <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                      {selectedProduct.impactMessage}
                    </p>
                  </div>
                </div>

                {/* Quantity & Add to Cart Controls */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-2 py-1 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer font-bold text-xs"
                        type="button"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 font-bold text-slate-900 text-xs">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-2 py-1 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer font-bold text-xs"
                        type="button"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-slate-900 ml-auto">
                      Subtotal: ₹{(selectedProduct.price * quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onAddToCart(selectedProduct, quantity);
                    }}
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    type="button"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Craft Cart (₹{(selectedProduct.price * quantity).toLocaleString()})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PRODUCT REVIEWS SECTION (COMPACT & OPTIMAL) */}
          <div id="feedback-reviews-section" className="pt-6 border-t border-slate-200 mt-6 space-y-3.5">
            {/* Header & Compact Summary Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500 shrink-0" />
                  <span className="text-sm font-black text-slate-900">{selectedProduct.rating}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${
                        star <= Math.round(selectedProduct.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-300 text-xs font-bold">·</span>
                <span className="text-xs font-bold text-slate-800">
                  Product Reviews ({((reviewsMap[selectedProduct.id] || [])).length || 2})
                </span>
                <span className="hidden sm:inline text-slate-300 text-xs font-bold">·</span>
                <span className="hidden sm:inline text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  Verified Buyers
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowReviewForm(prev => !prev)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <Star className="w-3.5 h-3.5 text-amber-400" />
                <span>{showReviewForm ? 'Close Form' : 'Write a Review'}</span>
              </button>
            </div>

            {/* Success notification if submitted */}
            {reviewSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2.5 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your product review has been submitted and published.</span>
              </div>
            )}

            {/* Compact "Write a Review" Form for Buyers */}
            {showReviewForm && (
              <div className="p-3.5 sm:p-4 bg-white rounded-xl border border-amber-300/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Submit Product Review</span>
                  </h4>
                  {/* Rating Selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-600">Rating:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(star)}
                          className="p-0.5 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              star <= (hoverRating || newRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-200 text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-700 ml-1">{hoverRating || newRating} / 5</span>
                  </div>
                </div>

                {/* Compact Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <input
                    type="text"
                    placeholder="Your Name (e.g. Suman Sharma)"
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    className="sm:col-span-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Write your product review (craftsmanship, quality, packaging)..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddReview(selectedProduct.id);
                      }
                    }}
                    className="sm:col-span-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Verified review published to this product page.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddReview(selectedProduct.id)}
                      disabled={!newReviewComment.trim()}
                      className="py-1.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Send className="w-3 h-3 text-amber-400" />
                      <span>Submit Review</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Compact Product Reviews List */}
            <div className="space-y-2">
              {(reviewsMap[selectedProduct.id] || [
                {
                  id: 'r1',
                  author: 'Ananya Roy',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120',
                  rating: 5,
                  date: 'Aug 04, 2026',
                  comment: 'Exquisite Kantha stitch work! The thread colors are vibrant and texture is super soft. Knowing this empowers women artisans in Birbhum makes it even more special.',
                  verifiedBuyer: true,
                  helpfulCount: 12
                },
                {
                  id: 'r2',
                  author: 'Vikram Sengupta',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120',
                  rating: 5,
                  date: 'Jul 28, 2026',
                  comment: 'Packed securely and delivered on time in Howrah. Outstanding quality and authentic craftsmanship!',
                  verifiedBuyer: true,
                  helpfulCount: 8
                }
              ]).map((review) => (
                <div
                  key={review.id}
                  className="p-3 sm:p-3.5 bg-white rounded-xl border border-slate-200/70 hover:border-slate-300 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-[10px] flex items-center justify-center shrink-0">
                        {review.author.charAt(0)}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{review.author}</span>
                      {review.verifiedBuyer && (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-200/70">
                          Verified Buyer
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">· {review.date}</span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-slate-200 text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    "{review.comment}"
                  </p>

                  <div className="flex items-center justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleAddHelpful(selectedProduct.id, review.id)}
                      className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-amber-800 transition-colors cursor-pointer bg-slate-50 hover:bg-amber-50/80 px-2 py-0.5 rounded border border-slate-200/60"
                    >
                      <ThumbsUp className="w-2.5 h-2.5 text-slate-400" />
                      <span className="font-semibold">Helpful ({review.helpfulCount})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Crafts Row inside section */}
          {relatedProducts.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>More Creations in {selectedProduct.category.replace('_', ' ')}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <div key={rel.id} className="flex flex-col h-full">
                    <SpotlightCard
                      onClick={() => {
                        setSelectedProduct(rel);
                        setActiveImageIdx(0);
                        setQuantity(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="flex flex-col h-full group rounded-2xl overflow-hidden transition-all cursor-pointer"
                    >
                      {/* Product Image */}
                      <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-100">
                        <img
                          src={rel.images[0]}
                          alt={rel.title}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                        {rel.originalPrice && (
                          <span className="absolute top-2 left-2 bg-slate-950/55 backdrop-blur-md text-amber-300 text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full border border-white/30 shadow-xs uppercase">
                            {Math.round(((rel.originalPrice - rel.price) / rel.originalPrice) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                            <span className="uppercase text-amber-800 font-extrabold tracking-wider truncate max-w-[80px]">
                              {rel.category.replace('_', ' ')}
                            </span>
                            <span className="flex items-center gap-0.5 text-amber-700 font-semibold shrink-0">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              {rel.rating}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-1 leading-snug">
                            {rel.title}
                          </h4>
                          <p className="text-[10px] text-slate-500 truncate">By {rel.artisanName}</p>
                        </div>

                        {/* Price & Action */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-slate-900">₹{rel.price.toLocaleString()}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(rel);
                            }}
                            className="px-2 py-1 rounded-md bg-[#FEDC00] hover:bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs border border-amber-300 whitespace-nowrap"
                            type="button"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    </SpotlightCard>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // DEFAULT GRID MARKETPLACE VIEW
  return (
    <div className="py-6 sm:py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Simplified Premium Page Header without bg */}
        <div className="max-w-3xl space-y-1.5 pb-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Rural Women Artisan Cooperative
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            Support original West Bengal village women weavers, potters, and crafters. Every single purchase directly provides fair wages and supports rural children's education.
          </p>
        </div>

        {/* Compact Filter, Search & Sort Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
          {/* Search Field */}
          <div className="relative flex-1 min-w-[180px] sm:min-w-[240px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crafts, artisans, regions..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                type="button"
              >
                ✕
              </button>
            )}
          </div>

          {/* Small Dropdowns: Category Filter & Sort By */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Filter className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold text-slate-700">Filter:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer text-xs shadow-2xs hover:bg-slate-50 transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden sm:inline text-xs font-bold text-slate-700">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-2.5 rounded-lg border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer text-xs shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <option value="featured">Featured Artisans</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Re-designed Premium Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="flex flex-col h-full">
              <SpotlightCard
                onClick={() => setSelectedProduct(product)}
                className="flex flex-col h-full group rounded-2xl overflow-hidden transition-all cursor-pointer"
              >
                {/* Product Image */}
                <div className="relative h-36 sm:h-40 overflow-hidden bg-slate-100">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />

                  {product.originalPrice && (
                    <span className="absolute top-2 left-2 bg-slate-950/55 backdrop-blur-md text-amber-300 text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full border border-white/30 shadow-xs uppercase">
                      {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span className="uppercase text-amber-800 font-extrabold tracking-wider truncate max-w-[90px]">
                        {product.category.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-0.5 text-amber-700 font-semibold shrink-0">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {product.rating}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors line-clamp-2 leading-snug">
                      {product.title}
                    </h3>

                    {/* Artisan Tag */}
                    <div className="flex items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] text-slate-600 font-medium truncate">By {product.artisanName}</span>
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          ₹{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      className="px-2 py-1 rounded-md bg-[#FEDC00] hover:bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs border border-amber-300 whitespace-nowrap"
                      type="button"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200/60 shadow-2xs">
            <p className="text-slate-500 font-medium text-xs">No artisan products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
