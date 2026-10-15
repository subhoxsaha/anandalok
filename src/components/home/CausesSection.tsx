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
  Droplets,
  Share2,
  Copy,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Users,
  Info
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
  selectedCause?: Cause | null;
  onSelectCause?: (cause: Cause | null) => void;
}

export const CausesSection: React.FC<CausesSectionProps> = ({
  causes = [],
  onOpenDonate,
  isLoading = false,
  selectedCause = null,
  onSelectCause
}) => {
  const [internalSelectedCause, setInternalSelectedCause] = useState<Cause | null>(null);
  const activeCause = selectedCause !== undefined ? selectedCause : internalSelectedCause;
  const setActiveCause = (c: Cause | null) => {
    if (onSelectCause) {
      onSelectCause(c);
    } else {
      setInternalSelectedCause(c);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        rawCause: c,
        title: c.title,
        subtitle: c.subtitle || getCategoryTag(c.category),
        description: c.description,
        icon: getCategoryIcon(c.category),
        impact: c.impactPer100 || 'Every contribution directly supports families in need.',
        image: c.imageUrl || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
        tag: getCategoryTag(c.category),
        targetAmount: c.targetAmount,
        raisedAmount: c.raisedAmount,
        donorCount: c.donorCount,
        taxExempt80G: c.taxExempt80G
      }))
    : defaultPillars.map(p => ({
        ...p,
        rawCause: undefined,
        targetAmount: 300000,
        raisedAmount: 185000,
        donorCount: 210,
        taxExempt80G: true
      }));

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

  // Share handlers
  const handleCopyCauseLink = (causeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}?tab=causes&cause=${causeId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(causeId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsAppShareCause = (title: string, causeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}?tab=causes&cause=${causeId}`;
    const text = encodeURIComponent(
      `Support Anandalok Welfare Foundation's initiative: *${title}* (80G Tax-Exempt NGO).\n\nLearn more and sponsor here: ${url}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <section id="causes" className="py-5 sm:py-6 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <FadeIn direction="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  80G Certified Non-Profit
                </span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  • Tax Exempt Donations
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Our Core Social Welfare Pillars
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm">
                Every contribution directly powers transparent, verified community transformation across Bengal.
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
                const target = pillar.targetAmount || 300000;
                const raised = pillar.raisedAmount || 0;
                const percent = Math.min(100, Math.round((raised / target) * 100));

                return (
                  <div
                    key={pillar.id}
                    className="px-2 sm:px-3 shrink-0"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <div className="h-full rounded-2xl glass-card flex flex-col justify-between overflow-hidden group border border-slate-200/80 bg-white hover:border-slate-300 transition-all shadow-xs hover:shadow-md">
                      <div>
                        {/* Image with Vignette & Heading */}
                        <div
                          className="relative h-48 sm:h-52 overflow-hidden bg-slate-950 cursor-pointer"
                          onClick={() => {
                            if (pillar.rawCause) setActiveCause(pillar.rawCause);
                          }}
                        >
                          <img
                            src={pillar.image}
                            alt={pillar.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent pointer-events-none" />

                          {/* Tag */}
                          <div className="absolute top-2.5 left-2.5 bg-slate-950/90 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border border-amber-300/30 shadow-xs z-10 backdrop-blur-xs">
                            {pillar.tag}
                          </div>

                          {/* Top Right Quick Share Button */}
                          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => handleCopyCauseLink(pillar.id, e)}
                              className="p-1.5 rounded-full bg-slate-950/80 text-white hover:bg-amber-400 hover:text-slate-950 transition-colors shadow-xs cursor-pointer"
                              title="Copy Cause link for sharing"
                            >
                              {copiedId === pillar.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>

                          {/* Heading */}
                          <div className="absolute bottom-0 inset-x-0 p-3.5 pt-12 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                            <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug drop-shadow-md line-clamp-2">
                              {pillar.title}
                            </h3>
                          </div>
                        </div>

                        {/* Body Content */}
                        <div className="p-4 sm:p-5 space-y-3">
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {pillar.description}
                          </p>

                          {/* Progress bar */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                              <span>Raised: ₹{raised.toLocaleString('en-IN')}</span>
                              <span className="text-slate-500 font-bold">{percent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                              <span>Goal: ₹{target.toLocaleString('en-IN')}</span>
                              <span>{pillar.donorCount || 0} donors</span>
                            </div>
                          </div>

                          {/* Direct Impact pill */}
                          <div className="bg-amber-50/80 border border-amber-200/80 rounded-lg p-2 text-[11px] text-amber-900 font-medium flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span>{pillar.impact}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom actions */}
                      <div className="p-4 pt-0 space-y-2">
                        <AnimatedDonateButton
                          onClick={() => onOpenDonate(pillar.id)}
                          variant="card"
                          label="Sponsor This Cause"
                        />
                        <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                          {pillar.rawCause && (
                            <button
                              type="button"
                              onClick={() => setActiveCause(pillar.rawCause)}
                              className="text-slate-600 hover:text-slate-950 font-bold underline cursor-pointer"
                            >
                              View Story & Updates →
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleWhatsAppShareCause(pillar.title, pillar.id, e)}
                            className="text-emerald-700 hover:text-emerald-800 font-bold ml-auto cursor-pointer flex items-center gap-1"
                          >
                            <span>Share</span>
                          </button>
                        </div>
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

      {/* Cause Detail Modal (Enhanced with SEO structured data & share options) */}
      {activeCause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            {/* Modal Image Header */}
            <div className="relative h-60 sm:h-72 bg-slate-950">
              <img
                src={activeCause.imageUrl}
                alt={activeCause.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              
              <button
                type="button"
                onClick={() => setActiveCause(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs">
                  {getCategoryTag(activeCause.category)}
                </span>
                {activeCause.taxExempt80G && (
                  <span className="bg-emerald-500/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <ShieldCheck className="w-3.5 h-3.5" /> 80G Tax Exempt
                  </span>
                )}
              </div>

              <div className="absolute bottom-4 inset-x-4 text-white">
                <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-sm">
                  {activeCause.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium">
                  {activeCause.subtitle}
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Funding Progress Bar */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-extrabold text-slate-900">
                    ₹{(activeCause.raisedAmount || 0).toLocaleString('en-IN')}{' '}
                    <span className="text-xs font-medium text-slate-500">
                      raised of ₹{(activeCause.targetAmount || 0).toLocaleString('en-IN')} goal
                    </span>
                  </span>
                  <span className="font-bold text-amber-600">
                    {Math.min(100, Math.round(((activeCause.raisedAmount || 0) / (activeCause.targetAmount || 1)) * 100))}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(((activeCause.raisedAmount || 0) / (activeCause.targetAmount || 1)) * 100)
                      )}%`
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {activeCause.donorCount || 0} active donors
                  </span>
                  <span className="text-emerald-700 font-semibold">100% Verified Community Use</span>
                </div>
              </div>

              {/* Direct Impact Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Direct Impact Breakdown
                  </h4>
                  <p className="text-sm text-amber-950 font-medium mt-0.5">
                    {activeCause.impactPer100}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">About this Welfare Initiative</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {activeCause.description}
                </p>
              </div>

              {/* Verified Field Updates */}
              {activeCause.updates && activeCause.updates.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Recent Field Updates & Ground Progress
                  </h4>
                  <div className="space-y-2.5">
                    {activeCause.updates.map((up, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{up.title}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{up.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{up.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share & Support Bar */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyCauseLink(activeCause.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    {copiedId === activeCause.id ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === activeCause.id ? 'Link Copied!' : 'Copy Direct Link'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleWhatsAppShareCause(activeCause.title, activeCause.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <AnimatedDonateButton
                    onClick={() => {
                      const id = activeCause.id;
                      setActiveCause(null);
                      onOpenDonate(id);
                    }}
                    variant="card"
                    label="Sponsor This Cause"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
