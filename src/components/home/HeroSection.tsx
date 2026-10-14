import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, Sparkles, Shirt, GraduationCap } from 'lucide-react';
import { MarqueeBanner, FadeIn, TiltCard, AnimatedCounter } from '../common/ReactBitsComponents';
import { AnimatedDonateButton } from '../common/AnimatedDonateButton';
import { AnimatedButton } from '../common/AnimatedButton';
import { IMPACT_STATS, INITIAL_HERO_IMAGES } from '../../data/initialData';
import { HeroImage } from '../../types';

interface HeroSectionProps {
  onOpenDonate: () => void;
  setActiveTab: (tab: string) => void;
  heroImages?: HeroImage[];
}

const iconMap = {
  Heart: Heart,
  Shirt: Shirt,
  Sparkles: Sparkles,
  GraduationCap: GraduationCap
};

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenDonate, setActiveTab, heroImages }) => {
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  const photos = heroImages && heroImages.length > 0 ? heroImages : INITIAL_HERO_IMAGES;

  // Auto-slide background photos
  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [photos.length]);

  // Ensure photoIndex stays in bounds if photos array length changes
  const activePhotoIndex = photoIndex >= photos.length ? 0 : photoIndex;
  const currentPhoto = photos[activePhotoIndex] || INITIAL_HERO_IMAGES[0];

  const marqueeText = [
    'Cloth Drive 2026: 2,600+ Warm Clothes Distributed in Sundarbans & Bengal',
    '45 Women Artisans Empowered in Anandalok Crafts Cooperative',
    'Shishu Pathshala Units Running with Digital Learning Tools for Children'
  ];

  return (
    <div className="relative overflow-hidden bg-slate-50 border-b border-slate-200/80">
      {/* Background Animated Photo Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentPhoto.id || activePhotoIndex}
            src={currentPhoto.url}
            alt={currentPhoto.caption}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.75, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Directional Overlay to keep text legible while showing vivid image on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-white/30 sm:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-slate-100/90" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Hero Content Column */}
          <FadeIn direction="up" className="lg:col-span-8 space-y-2.5">


            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-tight">
              Spreading Happiness By Holding Hands
            </h1>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl font-normal">
              Anandalok Welfare Foundation is dedicated to spreading happiness by holding hands. We empower underprivileged children through free evening education (Shishu Pathshala), conduct annual doorstep winter clothing and blanket drives, and foster financial independence for rural women artisans through fair-wage craft cooperatives across West Bengal.
            </p>

            {/* Compact Impact Stats Row above Buttons */}
            <div className="py-1">
              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                {IMPACT_STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white/90 backdrop-blur-xs border border-slate-200/90 rounded-xl p-2 sm:p-2.5 text-center shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all flex flex-col justify-center"
                  >
                    <div className="text-xs xs:text-sm sm:text-base font-black text-amber-950 leading-tight">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
                    </div>
                    <div className="text-[9px] xs:text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight mt-0.5">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-row items-center gap-2 sm:gap-3 pt-1 w-full max-w-md">
              <div className="flex-1 min-w-0">
                <AnimatedDonateButton
                  onClick={onOpenDonate}
                  variant="hero"
                  label="Donate Now"
                  className="w-full py-2.5 sm:py-3 px-2.5 sm:px-5 rounded-full bg-slate-950 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20 text-[11px] xs:text-xs sm:text-sm border border-slate-800 flex items-center justify-center gap-1.5 sm:gap-2 font-extrabold"
                />
              </div>

              <AnimatedButton
                onClick={() => setActiveTab('marketplace')}
                animationType="spring"
                className="flex-1 min-w-0 py-2.5 sm:py-3 px-2.5 sm:px-5 rounded-full bg-slate-100 hover:bg-slate-200 hover:border-slate-400 text-slate-900 font-bold text-[11px] xs:text-xs sm:text-sm border border-slate-300 flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs whitespace-nowrap overflow-hidden text-ellipsis group"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-slate-800 shrink-0 group-hover:scale-110 transition-transform duration-200" />
                <span className="truncate">Shop Crafts</span>
              </AnimatedButton>
            </div>
          </FadeIn>

          {/* Right Column - Field Photo Card */}
          <FadeIn direction="left" delay={0.2} className="lg:col-span-4">
            <TiltCard>
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-800/10 bg-slate-950 group">
                <div className="relative h-60 sm:h-68 rounded-2xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentPhoto.id || activePhotoIndex}
                      src={currentPhoto.url}
                      alt={currentPhoto.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="w-full h-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white space-y-1">
                    <span className="inline-block text-[10px] font-extrabold text-amber-300 uppercase tracking-wider bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 rounded border border-amber-400/30">
                      {currentPhoto.title}
                    </span>
                    <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-snug">
                      {currentPhoto.caption}
                    </p>
                  </div>

                  {/* Floating slide indicators inside carousel image */}
                  {photos.length > 1 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                      {photos.map((p, idx) => (
                        <button
                          key={p.id || idx}
                          type="button"
                          onClick={() => setPhotoIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            activePhotoIndex === idx
                              ? 'w-4 bg-amber-400'
                              : 'w-1.5 bg-white/50 hover:bg-white'
                          }`}
                          title={p.title}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TiltCard>
          </FadeIn>
        </div>
      </div>

      {/* Marquee Banner */}
      <MarqueeBanner items={marqueeText} />
    </div>
  );
};

