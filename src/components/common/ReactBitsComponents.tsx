import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause, Grid, Layers, MapPin } from 'lucide-react';

// 1. FadeIn Container
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
  duration?: number;
}

export const FadeIn: React.FC<FadeInProps> = ({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  duration = 0.5
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  const directionOffsets = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { x: 24, y: 0 },
    right: { x: -24, y: 0 },
    none: { x: 0, y: 0 }
  };

  const initialOffset = directionOffsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...initialOffset }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initialOffset }}
      transition={{ duration, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 2. StaggerContainer & StaggerItem
export const StaggerContainer: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0.1
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: delay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 3. SpotlightCard Component
interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden rounded-2xl border border-white/60 bg-white/75 backdrop-blur-md shadow-xs transition-shadow duration-300 hover:shadow-md hover:border-amber-300/50 ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// 4. AnimatedCounter Component
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  className = ''
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const totalSteps = 60 * duration;
    const increment = end / totalSteps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      start += increment;
      if (currentStep >= totalSteps) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// 5. ShinyText Component
export const ShinyText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  return (
    <span
      className={`inline-block bg-gradient-to-r from-amber-700 via-rose-600 to-amber-700 bg-[length:200%_100%] bg-clip-text text-transparent animate-shiny-text ${className}`}
      style={{
        animation: 'shinyText 3s linear infinite'
      }}
    >
      {text}
    </span>
  );
};

// 6. TiltCard Component
export const TiltCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 7. MagnetButton Component
export const MagnetButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
}> = ({ children, onClick, className = '', variant = 'primary' }) => {
  const variantStyles = {
    primary:
      'bg-slate-950 text-white hover:bg-slate-800 shadow-xs border border-slate-900',
    secondary: 'bg-[#FEDC00] text-slate-950 font-black hover:bg-amber-300 border border-amber-300 shadow-2xs',
    accent: 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs',
    outline: 'border border-slate-300 text-slate-800 hover:bg-slate-100 bg-white'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full font-bold transition-colors cursor-pointer text-xs flex items-center justify-center gap-2 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// 8. MarqueeBanner Component
export const MarqueeBanner: React.FC<{ items: string[] }> = ({ items }) => {
  return (
    <div className="overflow-hidden whitespace-nowrap bg-[#FEDC00] text-slate-950 py-2.5 border-y border-amber-300 shadow-2xs">
      <div className="inline-flex animate-marquee gap-10 items-center text-xs font-black tracking-wide select-none">
        {items.concat(items).map((item, idx) => (
          <span key={idx} className="inline-flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-slate-950 shrink-0" />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

// 9. GlassModal Component
export const GlassModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative w-full ${maxWidth} bg-white/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden z-10 my-8`}
          >
            {title && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/45 bg-white/45">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <button
                  onClick={onClose}
                  className="rounded-full p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="p-4 sm:p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 8. Depth Carousel Component (ReactBits 3D Stacked Perspective)
interface DepthCarouselProps<T> {
  items: T[];
  renderItem: (item: T, isActive: boolean, index: number) => React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
  className?: string;
  autoPlay?: boolean;
  interval?: number;
}

export function DepthCarousel<T>({
  items,
  renderItem,
  onItemClick,
  className = '',
  autoPlay = false,
  interval = 5000
}: DepthCarouselProps<T>) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!autoPlay || isHovered || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isHovered, items.length, interval]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  if (!items || items.length === 0) return null;

  return (
    <div
      className={`relative w-full overflow-hidden py-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Depth Viewport */}
      <div
        className="relative mx-auto h-[390px] xs:h-[410px] sm:h-[430px] w-full max-w-5xl flex items-center justify-center overflow-visible"
        style={{ perspective: '1100px', transformStyle: 'preserve-3d' }}
      >
        {items.map((item, index) => {
          let offset = index - activeIndex;

          if (items.length > 2) {
            if (offset > items.length / 2) offset -= items.length;
            if (offset < -items.length / 2) offset += items.length;
          }

          const isActive = offset === 0;

          let translateX = '0%';
          let rotateY = 0;
          let scale = 1;
          let opacity = 1;
          let zIndex = 30;

          if (offset === 0) {
            translateX = '0%';
            rotateY = 0;
            scale = 1;
            opacity = 1;
            zIndex = 30;
          } else if (offset === 1) {
            translateX = '58%';
            rotateY = -24;
            scale = 0.86;
            opacity = 0.75;
            zIndex = 20;
          } else if (offset === -1) {
            translateX = '-58%';
            rotateY = 24;
            scale = 0.86;
            opacity = 0.75;
            zIndex = 20;
          } else if (offset >= 2) {
            translateX = '98%';
            rotateY = -38;
            scale = 0.72;
            opacity = 0.35;
            zIndex = 10;
          } else if (offset <= -2) {
            translateX = '-98%';
            rotateY = 38;
            scale = 0.72;
            opacity = 0.35;
            zIndex = 10;
          }

          return (
            <motion.div
              key={index}
              initial={false}
              animate={{
                x: translateX,
                rotateY: rotateY,
                scale: scale,
                opacity: opacity,
                zIndex: zIndex
              }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 24
              }}
              onClick={() => {
                if (!isActive) {
                  setActiveIndex(index);
                } else if (onItemClick) {
                  onItemClick(item, index);
                }
              }}
              className={`absolute w-[290px] xs:w-[320px] sm:w-[360px] md:w-[400px] select-none ${
                isActive ? 'cursor-pointer' : 'cursor-pointer hover:brightness-105'
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {renderItem(item, isActive, index)}
            </motion.div>
          );
        })}
      </div>

      {/* Control Navigation */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button
          onClick={handlePrev}
          type="button"
          aria-label="Previous story"
          className="p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeIndex === idx ? 'w-6 bg-amber-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to story ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          type="button"
          aria-label="Next story"
          className="p-2 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

// 9. Dome Gallery Component (ReactBits 3D Spherical Dome)
interface DomeGalleryProps<T> {
  items: T[];
  renderTile: (item: T, index: number) => React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
  className?: string;
  radius?: number;
}

export function DomeGallery<T>({
  items,
  renderTile,
  onItemClick,
  className = '',
  radius = 420
}: DomeGalleryProps<T>) {
  const [rotY, setRotY] = useState(0);
  const [rotX, setRotX] = useState(-5);
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const [viewMode, setViewMode] = useState<'dome' | 'grid'>('dome');
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; rotX: number; rotY: number }>({ x: 0, y: 0, rotX: -5, rotY: 0 });

  // Auto rotation loop
  useEffect(() => {
    if (!isAutoSpin || isDragging || viewMode !== 'dome') return;
    const interval = setInterval(() => {
      setRotY((prev) => (prev + 0.35) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoSpin, isDragging, viewMode]);

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (viewMode !== 'dome') return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || viewMode !== 'dome') return;
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    setRotY(dragStart.current.rotY + deltaX * 0.4);
    setRotX(Math.max(-35, Math.min(35, dragStart.current.rotX - deltaY * 0.3)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  if (!items || items.length === 0) return null;

  const rowsCount = 3;
  const latitudes = [-22, 0, 22];

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 px-1 sm:px-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="bg-amber-100 text-amber-900 border border-amber-300/60 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-2xs">
            ReactBits 3D Dome
          </span>
          <span className="text-[11px] text-slate-600 hidden sm:inline">
            {viewMode === 'dome' ? 'Drag/swipe to rotate the 3D gallery dome surface' : 'Grid layout view'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'dome' && (
            <>
              <button
                type="button"
                onClick={() => setIsAutoSpin(!isAutoSpin)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isAutoSpin
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
                title={isAutoSpin ? 'Pause auto spin' : 'Start auto spin'}
              >
                {isAutoSpin ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isAutoSpin ? 'Pause' : 'Auto Spin'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRotX(-5);
                  setRotY(0);
                }}
                className="px-3 py-1 rounded-full bg-white text-slate-700 border border-slate-200 text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Reset Orientation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </>
          )}

          <div className="flex items-center bg-slate-200/80 p-0.5 rounded-full border border-slate-300">
            <button
              type="button"
              onClick={() => setViewMode('dome')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'dome' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Dome</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'dome' ? (
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="relative w-full h-[460px] sm:h-[520px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden rounded-3xl bg-slate-950/90 border border-amber-400/30 shadow-2xl"
          style={{ perspective: '1100px' }}
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-slate-950/80 to-slate-950 pointer-events-none" />

          {/* 3D Rotatable Dome Container */}
          <div
            className="relative w-0 h-0 transition-transform duration-75 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`
            }}
          >
            {items.map((item, index) => {
              const rowIndex = index % rowsCount;
              const colIndex = Math.floor(index / rowsCount);
              const itemsInThisRow = Math.ceil(items.length / rowsCount);
              
              const phi = latitudes[rowIndex] || 0;
              const theta = (colIndex / Math.max(1, itemsInThisRow)) * 360 + (rowIndex % 2 === 1 ? 180 / itemsInThisRow : 0);

              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onItemClick) onItemClick(item, index);
                  }}
                  className="absolute left-1/2 top-1/2 -ml-[110px] -mt-[75px] xs:-ml-[130px] xs:-mt-[85px] sm:-ml-[145px] sm:-mt-[95px] w-[220px] xs:w-[260px] sm:w-[290px] h-[150px] xs:h-[170px] sm:h-[190px] rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-white/20 transition-transform duration-300 hover:scale-110 hover:border-amber-400 group"
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    transform: `rotateY(${theta}deg) rotateX(${phi}deg) translateZ(${radius}px)`
                  }}
                >
                  {renderTile(item, index)}
                </div>
              );
            })}
          </div>

          {/* Rotational Navigation Arrows */}
          <button
            type="button"
            onClick={() => setRotY((prev) => prev - 45)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white border border-white/20 shadow-lg backdrop-blur-md transition-colors cursor-pointer z-20"
            aria-label="Rotate Left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setRotY((prev) => prev + 45)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-amber-500 text-white border border-white/20 shadow-lg backdrop-blur-md transition-colors cursor-pointer z-20"
            aria-label="Rotate Right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* Grid Layout Mode */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item, index) => (
            <div
              key={index}
              onClick={() => onItemClick && onItemClick(item, index)}
              className="cursor-pointer"
            >
              {renderTile(item, index)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

