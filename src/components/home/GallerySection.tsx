import React, { useState, useEffect, useCallback } from 'react';
import { GalleryItem } from '../../types';
import {
  MapPin,
  Calendar,
  Images,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Check,
  ArrowRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedButton } from '../common/AnimatedButton';

interface GallerySectionProps {
  items: GalleryItem[];
  isHome?: boolean;
  setActiveTab?: (tab: string) => void;
}

type CategoryFilter = 'all' | 'cloth_drives' | 'children' | 'women' | 'crafts' | 'events';

export const GallerySection: React.FC<GallerySectionProps> = ({ items, isHome, setActiveTab }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
  // Lightbox state with zoom and social share
  const [lightboxActive, setLightboxActive] = useState<{
    images: string[];
    index: number;
    title: string;
    location: string;
    date: string;
    description: string;
    category: string;
    photographer?: string;
  } | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [showShareMenu, setShowShareMenu] = useState<boolean>(false);

  // Filter gallery items by category for dedicated view
  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const handleOpenLightbox = (imagesList: string[], idx: number, folder: Partial<GalleryItem>) => {
    setZoomLevel(1);
    setCopiedShare(false);
    setShowShareMenu(false);
    setLightboxActive({
      images: imagesList.length > 0 ? imagesList : [folder.imageUrl || ''],
      index: idx,
      title: folder.title || 'Anandalok Field Log',
      location: folder.location || 'Bengal',
      date: folder.date || 'Recent',
      description: folder.description || 'Raw field capture from Anandalok Welfare Foundation.',
      category: folder.category || 'events',
      photographer: folder.photographer
    });
  };

  const handlePrevLightbox = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxActive) return;
    setZoomLevel(1);
    setLightboxActive((prev) => {
      if (!prev) return null;
      const prevIdx = (prev.index - 1 + prev.images.length) % prev.images.length;
      return { ...prev, index: prevIdx };
    });
  }, [lightboxActive]);

  const handleNextLightbox = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!lightboxActive) return;
    setZoomLevel(1);
    setLightboxActive((prev) => {
      if (!prev) return null;
      const nextIdx = (prev.index + 1) % prev.images.length;
      return { ...prev, index: nextIdx };
    });
  }, [lightboxActive]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxActive(null);
      } else if (e.key === 'ArrowLeft') {
        handlePrevLightbox();
      } else if (e.key === 'ArrowRight') {
        handleNextLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxActive, handlePrevLightbox, handleNextLightbox]);

  // Social Share handler
  const handleShare = async (platform?: 'native' | 'whatsapp' | 'twitter' | 'copy') => {
    if (!lightboxActive) return;
    const shareText = `Explore "${lightboxActive.title}" - Anandalok Welfare Foundation Field Log from ${lightboxActive.location}:`;
    const shareUrl = window.location.href;

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
      return;
    }

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
      return;
    }

    if (navigator.share && platform === 'native') {
      try {
        await navigator.share({
          title: lightboxActive.title,
          text: shareText,
          url: shareUrl
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2400);
    } catch {
      // Ignored
    }
  };

  /* =========================================================================
     1. HOME PAGE SECTION 4 LAYOUT: 3 MOVING ROWS WITH INFINITE DRIFT
     ========================================================================= */
  if (isHome) {
    // Gather all unique image URLs from all folder galleries
    const allImages: string[] = items.reduce((acc, item) => {
      const images = item.images && item.images.length > 0 ? item.images : [item.imageUrl];
      return [...acc, ...images.filter(img => !acc.includes(img))];
    }, [] as string[]);

    // Split all images into 3 distinct rows for maximum staggered flow density
    function chunkArray<T>(arr: T[], chunks: number): T[][] {
      const result: T[][] = Array.from({ length: chunks }, () => []);
      arr.forEach((item, index) => {
        result[index % chunks].push(item);
      });
      return result;
    }
    
    const rows = chunkArray<string>(allImages, 3);

    return (
      <section className="py-10 sm:py-14 bg-[#FDFBF7] border-b border-amber-900/10 overflow-hidden relative select-none">
        {/* Ambient Warm Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-1.5">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
              Sights of Hope & Dignity
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
              Unfiltered, raw captures from our active blanket distributions, children learning pathshalas, and rural artisan workshops across Bengal. Hover over any row to pause.
            </p>
          </div>

          {/* Staggered Infinite Drift Rows (3 moving rows with 0 gaps) */}
          <div className="relative py-1">
            {rows.map((rowImages, index) => {
              if (rowImages.length === 0) return null;
              const direction = index % 2 === 0 ? 'normal' : 'reverse';
              const speed = index === 0 ? '45s' : index === 1 ? '55s' : '50s';
              
              // Repeat list 4 times for seamless continuous layout
              const repeatedImages = [...rowImages, ...rowImages, ...rowImages, ...rowImages];

              return (
                <div 
                  key={index} 
                  className="overflow-hidden flex w-full relative group"
                  onMouseEnter={() => setHoveredRow(index)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div 
                    className="flex gap-0 w-max animate-marquee"
                    style={{
                      animationDuration: speed,
                      animationDirection: direction === 'reverse' ? 'reverse' : 'normal',
                      animationPlayState: hoveredRow === index ? 'paused' : 'running'
                    }}
                  >
                    {repeatedImages.map((src, imgIdx) => {
                      return (
                        <div 
                          key={imgIdx} 
                          className="w-44 sm:w-64 h-32 sm:h-44 overflow-hidden border-0 shrink-0 cursor-default relative bg-transparent"
                        >
                          <img 
                            src={src} 
                            alt="Impact Event Snapshot" 
                            className="w-full h-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            
            {/* Soft left & right vignetted edges */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-[#FDFBF7] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-[#FDFBF7] to-transparent z-10" />
          </div>

          {/* Redirect Button to Full Gallery */}
          {setActiveTab && (
            <div className="text-center pt-2">
              <AnimatedButton
                onClick={() => setActiveTab('gallery')}
                animationType="spring"
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-tight transition-all shadow-xs hover:shadow-md cursor-pointer inline-flex items-center gap-2 group border border-slate-700"
              >
                <span>View Full Impact Gallery ({items.length} Expeditions)</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </AnimatedButton>
            </div>
          )}

        </div>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {lightboxActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl select-none"
              onClick={() => setLightboxActive(null)}
            >
              {/* Lightbox Header Controls */}
              <div 
                className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/90 to-transparent text-white z-20 border-b border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-0.5 max-w-[60%]">
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {lightboxActive.title}
                  </span>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> {lightboxActive.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" /> {lightboxActive.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Close Button */}
                  <button
                    onClick={() => setLightboxActive(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Viewport Image */}
              <div 
                className="flex-1 max-h-[78vh] max-w-[85vw] mx-auto flex items-center justify-center p-2 relative overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={lightboxActive.index}
                  src={lightboxActive.images[lightboxActive.index]}
                  alt={`${lightboxActive.title} - Full View`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl border border-white/10 select-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
  }

  /* =========================================================================
     2. DEDICATED FULL GALLERY TAB MODE
     ========================================================================= */
  const categories: { id: CategoryFilter; label: string }[] = [
    { id: 'all', label: 'All Field Logs' },
    { id: 'cloth_drives', label: 'Blanket & Cloth Drives' },
    { id: 'children', label: 'Children Pathshala' },
    { id: 'women', label: 'Women Self-Help' },
    { id: 'crafts', label: 'Artisan Workshops' },
    { id: 'events', label: 'Community Melas' }
  ];

  return (
    <section className="relative py-12 sm:py-16 bg-gradient-to-b from-[#FDFBF7] via-orange-50/20 to-[#FAF6EE] border-b border-amber-900/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-heading">
            Moments of Hope & Dignity
          </h2>
          
          <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Raw, unfiltered photo records from our active relief expeditions, children education centers, and artisan craft clusters across Bengal. Click any expedition card to inspect multi-photo albums with high-res zoom.
          </p>
        </div>

        {/* Category Filter Micro-Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs shadow-amber-500/25 scale-102'
                  : 'bg-white/80 hover:bg-white text-slate-700 hover:text-amber-900 border-amber-900/10 shadow-2xs backdrop-blur-xs'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategory === cat.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              )}
            </button>
          ))}
        </div>

        {/* Grid View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredItems.map((item, idx) => {
            const imagesList = item.images && item.images.length > 0 ? item.images : [item.imageUrl];

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="group relative cursor-pointer"
                onClick={() => handleOpenLightbox(imagesList, 0, item)}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-amber-500/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] group-hover:shadow-[0_20px_40px_rgba(245,158,11,0.18)] group-hover:border-amber-400/60 transition-all duration-500 flex flex-col h-full transform group-hover:-translate-y-1">
                  
                  {/* Image Container with Vignette Overlay */}
                  <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Vignette Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent pointer-events-none" />

                    {/* Inspect Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 bg-slate-950/20">
                      <span className="px-4 py-2 rounded-xl bg-amber-500/95 text-slate-950 font-extrabold text-xs tracking-wide shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Inspect High-Res & Zoom</span>
                      </span>
                    </div>

                    {/* Category, Photographer, Title, Location & Date inside Image Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-3.5 sm:p-4 space-y-1.5 z-10 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent pt-8">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded backdrop-blur-xs">
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1 leading-snug drop-shadow-xs">
                        {item.title}
                      </h3>

                      {/* Location & Date */}
                      <div className="flex items-center justify-between text-[11px] text-amber-200/90 font-medium pt-0.5">
                        <div className="flex items-center gap-1 text-slate-200 truncate max-w-[65%]">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="truncate">{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-300 shrink-0">
                          <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-gradient-to-b from-white/90 to-amber-50/30">
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="pt-2 border-t border-amber-900/10 flex items-center justify-between text-xs font-bold text-amber-800">
                      <span className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>View Photo Album</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Click to open</span>
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      {/* FULL LIGHTBOX MODAL */}
      <AnimatePresence>
        {lightboxActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl select-none"
            onClick={() => setLightboxActive(null)}
          >
            <div 
              className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/90 to-transparent text-white z-20 border-b border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-0.5 max-w-[60%]">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md">
                    {lightboxActive.category.replace('_', ' ')}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                    {lightboxActive.title}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400" /> {lightboxActive.location}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> {lightboxActive.date}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLightboxActive(null)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div 
              className="flex-1 max-h-[78vh] max-w-[85vw] mx-auto flex items-center justify-center p-2 relative overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                key={lightboxActive.index}
                src={lightboxActive.images[lightboxActive.index]}
                alt={`${lightboxActive.title}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl border border-white/10 select-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};
