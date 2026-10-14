import React, { useRef } from 'react';
import { ShoppingBag, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ArtisanProduct } from '../../types';
import { SpotlightCard, FadeIn } from '../common/ReactBitsComponents';
import { AnimatedButton } from '../common/AnimatedButton';

interface ArtisanMarketplaceSectionProps {
  products: ArtisanProduct[];
  onAddToCart: (product: ArtisanProduct) => void;
  onOpenProductDetail: (product: ArtisanProduct) => void;
  setActiveTab: (tab: string) => void;
  isLoading?: boolean;
}

export const ArtisanMarketplaceSection: React.FC<ArtisanMarketplaceSectionProps> = ({
  products,
  onAddToCart,
  onOpenProductDetail,
  setActiveTab,
  isLoading = false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const featuredProducts = products.length > 0 ? products : [];

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-5 sm:py-6 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-3.5">
            <div className="space-y-1 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Handcrafted by Rural Artisans
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Every purchase directly empowers rural women and craft families with fair wages.
              </p>
            </div>

             <div className="flex items-center gap-2 self-start md:self-auto">
              {/* Scroll Controls */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full p-1 shadow-2xs">
                <AnimatedButton
                  onClick={() => handleScroll('left')}
                  animationType="scale"
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Scroll Left"
                  type="button"
                >
                  <ChevronLeft className="w-4 h-4" />
                </AnimatedButton>
                <AnimatedButton
                  onClick={() => handleScroll('right')}
                  animationType="scale"
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                  title="Scroll Right"
                  type="button"
                >
                  <ChevronRight className="w-4 h-4" />
                </AnimatedButton>
              </div>

              <AnimatedButton
                onClick={() => setActiveTab('marketplace')}
                animationType="magnetic"
                className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs group"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </AnimatedButton>
            </div>
          </div>
        </FadeIn>

        {/* Product Single Row Horizontal Scroll */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto w-full max-w-full overscroll-x-contain pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <div key={`marketplace-skel-${idx}`} className="w-48 sm:w-56 shrink-0 snap-start animate-pulse">
                <div className="flex flex-col h-full rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
                  <div className="h-36 sm:h-40 bg-slate-200/80" />
                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-2.5 w-16 bg-slate-200 rounded" />
                        <div className="h-2.5 w-8 bg-slate-200 rounded" />
                      </div>
                      <div className="h-3.5 w-full bg-slate-200 rounded" />
                      <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                      <div className="h-2.5 w-20 bg-slate-200 rounded mt-1" />
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="h-4 w-12 bg-slate-200 rounded" />
                      <div className="h-6 w-20 bg-slate-200 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <div key={product.id} className="w-48 sm:w-56 shrink-0 snap-start">
              <SpotlightCard
                onClick={() => {
                  onOpenProductDetail(product);
                  setActiveTab('marketplace');
                }}
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

                    <AnimatedButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      animationType="pill"
                      className="px-2 py-1 rounded-md bg-[#FEDC00] hover:bg-amber-400 text-slate-950 text-[10px] sm:text-[11px] font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-2xs border border-amber-300 whitespace-nowrap"
                      type="button"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </AnimatedButton>
                  </div>
                </div>
              </SpotlightCard>
            </div>
          ))
        )}
        </div>
      </div>
    </section>
  );
};

