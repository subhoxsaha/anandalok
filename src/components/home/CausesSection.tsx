import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  Shirt,
  GraduationCap,
  Sparkles,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Stethoscope,
  Droplets
} from 'lucide-react';
import { Cause } from '../../types';
import { FadeIn } from '../common/ReactBitsComponents';
import { AnimatedDonateButton } from '../common/AnimatedDonateButton';
import { AnimatedButton } from '../common/AnimatedButton';

interface CausesSectionProps {
  causes?: Cause[];
  onOpenDonate: (causeId?: string) => void;
  setActiveTab?: (tab: string) => void;
  isLoading?: boolean;
}

export const CausesSection: React.FC<CausesSectionProps> = ({ causes = [], onOpenDonate, isLoading = false }) => {
  const defaultPillars = [
    {
      id: 'child_education',
      title: 'Shishu Pathshala & Child Nutrition',
      subtitle: 'Free Education & Daily Meal Drive',
      description: 'Providing free tutoring, digital learning tablets, school supplies, and daily nutritious meals to over 800+ underprivileged children in Durgapur and nearby villages.',
      icon: GraduationCap,
      impact: '₹1,000 sponsors school supplies & meals for 1 child for a full month',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
      tag: 'Child Welfare'
    },
    {
      id: 'cloth_drive',
      title: 'Vastra Daan Cloth & Warmth Drives',
      subtitle: 'Winter & Festival Clothing Distribution',
      description: 'Conducting audited doorstep cloth collection drives, sorting gently used clothes, and distributing warm blankets and new festival wear to families in night shelters.',
      icon: Shirt,
      impact: '₹500 provides 2 warm thermal blankets & clothing kits',
      image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
      tag: 'Clothing Drives'
    },
    {
      id: 'women_artisan',
      title: 'Rural Women Artisan Empowerment',
      subtitle: 'Kantha, Pottery & Jute Craft Guild',
      description: 'Training and employing rural women in authentic Bengali crafts—Kantha embroidery, Bankura terracotta, and eco-friendly jute products with direct fair wages.',
      icon: Sparkles,
      impact: '₹2,500 provides raw material kits & fair wages to 1 artisan family',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800',
      tag: 'Empowerment'
    },
    {
      id: 'mobile_health',
      title: 'Gramin Swasthya Mobile Health Camps',
      subtitle: 'Free Medical Checkups & Medicines',
      description: 'Organizing weekend healthcare camps with doctors, distributing free essential medicines, health screening, and first-aid kits across remote West Bengal villages.',
      icon: Stethoscope,
      impact: '₹1,500 funds health checkups & medicines for 10 villagers',
      image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
      tag: 'Healthcare'
    },
    {
      id: 'clean_water',
      title: 'Nirmal Jal & Rural Hygiene Stations',
      subtitle: 'Safe Drinking Water & Sanitation',
      description: 'Installing solar-powered water filtration units and community sanitation stations in fluoride-affected village clusters, ensuring safe drinking water for families.',
      icon: Droplets,
      impact: '₹3,000 provides clean drinking water access for 25 families',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&q=80&w=800',
      tag: 'Rural Water'
    }
  ];

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'child_welfare':
        return GraduationCap;
      case 'cloth_distribution':
        return Shirt;
      case 'women_empowerment':
        return Sparkles;
      case 'food_health':
        return Stethoscope;
      default:
        return Heart;
    }
  };

  const getCategoryTag = (category?: string) => {
    switch (category) {
      case 'child_welfare':
        return 'Child Welfare';
      case 'cloth_distribution':
        return 'Clothing Drives';
      case 'women_empowerment':
        return 'Empowerment';
      case 'food_health':
        return 'Healthcare & Food';
      default:
        return 'Social Welfare';
    }
  };

  const pillars = causes && causes.length > 0
    ? causes.map((c) => ({
        id: c.id,
        title: c.title,
        subtitle: c.subtitle || getCategoryTag(c.category),
        description: c.description,
        icon: getCategoryIcon(c.category),
        impact: c.impactPer100 || 'Every contribution directly supports families in need.',
        image: c.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
        tag: getCategoryTag(c.category)
      }))
    : defaultPillars;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const isHoveredRef = useRef(false);

  // Responsive items per view detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, pillars.length - visibleCount);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      if (!isHoveredRef.current) {
        nextSlide();
      }
    }, 4500);

    return () => clearInterval(timer);
  }, [isPlaying, maxIndex, visibleCount]);

  return (
    <section id="causes" className="py-5 sm:py-6 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="space-y-1.5 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Our Core Social Welfare Pillars
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Every contribution directly powers these life-changing initiatives.
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center gap-3">
              <AnimatedButton
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                animationType="scale"
                className="p-2 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
                title={isPlaying ? 'Pause auto-slide' : 'Play auto-slide'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </AnimatedButton>

              <div className="flex items-center gap-1.5">
                <AnimatedButton
                  type="button"
                  onClick={prevSlide}
                  animationType="spring"
                  className="p-2.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-950 hover:text-white hover:border-slate-950 text-slate-800 transition-all cursor-pointer shadow-2xs"
                  title="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </AnimatedButton>

                <AnimatedButton
                  type="button"
                  onClick={nextSlide}
                  animationType="spring"
                  className="p-2.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-950 hover:text-white hover:border-slate-950 text-slate-800 transition-all cursor-pointer shadow-2xs"
                  title="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </AnimatedButton>
              </div>

              <AnimatedDonateButton
                onClick={() => onOpenDonate()}
                variant="hero"
                label="Donate"
                showSparkle={true}
              />
            </div>
          </div>
        </FadeIn>

        {/* Carousel Container */}
        <div
          className="relative overflow-hidden w-full max-w-full pt-2 pb-4"
          onMouseEnter={() => (isHoveredRef.current = true)}
          onMouseLeave={() => (isHoveredRef.current = false)}
        >
          <div
            className="flex transition-transform duration-500 ease-out w-full"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`
            }}
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`cause-skel-${idx}`}
                  className="px-2 sm:px-3 shrink-0 animate-pulse"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <div className="h-full rounded-2xl border border-slate-200/80 bg-white flex flex-col justify-between overflow-hidden shadow-2xs">
                    <div>
                      <div className="h-48 sm:h-52 bg-slate-200/80 relative">
                        <div className="absolute top-2.5 left-2.5 h-4 w-20 bg-slate-300 rounded" />
                        <div className="absolute bottom-3 left-3 h-5 w-3/4 bg-slate-300/90 rounded" />
                      </div>
                      <div className="p-4 sm:p-5 space-y-2">
                        <div className="h-3 w-full bg-slate-200 rounded" />
                        <div className="h-3 w-11/12 bg-slate-200 rounded" />
                        <div className="h-3 w-2/3 bg-slate-200 rounded" />
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="h-10 w-full bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              pillars.map((pillar) => {
                return (
                <div
                  key={pillar.id}
                  className="px-2 sm:px-3 shrink-0"
                  style={{ width: `${100 / visibleCount}%` }}
                >
                  <div className="h-full rounded-2xl glass-card flex flex-col justify-between overflow-hidden group">
                    <div>
                    {/* Image with Vignette, Heading and Bottom-side Fade Out Effect */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                      <img
                        src={pillar.image}
                        alt={pillar.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Ambient Vignette Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent pointer-events-none" />

                      {/* Tag */}
                      <div className="absolute top-2.5 left-2.5 bg-slate-950/90 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border border-amber-300/30 shadow-xs z-10 backdrop-blur-xs">
                        {pillar.tag}
                      </div>

                      {/* Heading inside image with prominent bottom fade-out gradient */}
                      <div className="absolute bottom-0 inset-x-0 p-3.5 pt-12 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-md line-clamp-2">
                          {pillar.title}
                        </h3>
                      </div>

                      {/* Bottom-side fade out feathering */}
                      <div className="absolute bottom-0 inset-x-0 h-5 bg-gradient-to-b from-transparent to-slate-950/40 pointer-events-none z-10" />
                    </div>

                    {/* Body Content with subtle bottom fade out transition */}
                    <div className="p-4 sm:p-5 space-y-2.5 relative bg-gradient-to-b from-slate-950/[0.03] to-transparent">
                      <p className="text-xs text-slate-600 leading-relaxed min-h-[50px] line-clamp-3">
                        {pillar.description}
                      </p>
                      {/* Soft bottom fade out hint */}
                      <div className="absolute bottom-1 inset-x-4 sm:inset-x-5 h-3 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
                    </div>
                    </div>

                    <div className="p-4 pt-0">
                      <AnimatedDonateButton
                        onClick={() => onOpenDonate(pillar.id)}
                        variant="card"
                        label="Sponsor This Cause"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-7 bg-slate-950'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
