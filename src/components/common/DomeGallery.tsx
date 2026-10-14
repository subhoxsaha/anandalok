import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause, Maximize2, MapPin, X } from 'lucide-react';
import './DomeGallery.css';

export interface DomeGalleryItem {
  id?: string | number;
  src: string;
  alt?: string;
  title?: string;
  category?: string;
  location?: string;
  date?: string;
}

export interface DomeGalleryProps {
  images?: (string | DomeGalleryItem)[];
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  minRadius?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  onItemClick?: (item: DomeGalleryItem, index: number) => void;
  className?: string;
}

export const DEFAULT_IMAGES: DomeGalleryItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80',
    title: 'Free Health Checkup Camp',
    category: 'Healthcare',
    location: 'Sundarbans, WB',
    date: 'Jan 2025'
  },
  {
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    title: 'Rural Education & Digital Literacy',
    category: 'Education',
    location: 'Bankura District',
    date: 'Feb 2025'
  },
  {
    src: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=800&q=80',
    title: 'Women Weavers Self-Help Group',
    category: 'Empowerment',
    location: 'Shantiniketan',
    date: 'Mar 2025'
  },
  {
    src: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80',
    title: 'Flood Relief & Warm Clothes Distribution',
    category: 'Relief Work',
    location: 'Ghatal, WB',
    date: 'Nov 2024'
  },
  {
    src: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?auto=format&fit=crop&w=800&q=80',
    title: 'Community Kitchen & Meal Distribution',
    category: 'Nutrition',
    location: 'Kolkata Outskirts',
    date: 'Dec 2024'
  },
  {
    src: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&w=800&q=80',
    title: 'Youth Vocational & Skill Training',
    category: 'Skill Building',
    location: 'Howrah, WB',
    date: 'Jan 2025'
  },
  {
    src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80',
    title: 'Child Welfare & Hygiene Kit Drive',
    category: 'Healthcare',
    location: 'Purulia, WB',
    date: 'Feb 2025'
  },
  {
    src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
    title: 'Artisan Crafts Exposition',
    category: 'Livelihood',
    location: 'Kolkata Fairground',
    date: 'Mar 2025'
  }
];

export const DomeGallery: React.FC<DomeGalleryProps> = ({
  images = DEFAULT_IMAGES,
  overlayBlurColor = 'rgba(15, 23, 42, 0.85)',
  maxVerticalRotationDeg = 32,
  minRadius = 400,
  autoRotate = true,
  autoRotateSpeed = 0.25,
  onItemClick,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState<number>(-4);
  const [rotY, setRotY] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(autoRotate);
  const [selectedItem, setSelectedItem] = useState<DomeGalleryItem | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({
    x: 0,
    y: 0,
    rotX: -4,
    rotY: 0
  });
  const velocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Normalize images to DomeGalleryItem array
  const itemList: DomeGalleryItem[] = images.map((item, idx) => {
    if (typeof item === 'string') {
      return { id: idx, src: item, title: `Impact Story #${idx + 1}` };
    }
    return { id: item.id || idx, ...item };
  });

  // Inertia and Auto Rotation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      if (!isDraggingRef.current) {
        // Apply friction to velocity
        velocityRef.current.x *= 0.92;
        velocityRef.current.y *= 0.92;

        if (Math.abs(velocityRef.current.x) > 0.01 || Math.abs(velocityRef.current.y) > 0.01) {
          setRotY((prev) => prev + velocityRef.current.x);
          setRotX((prev) =>
            Math.max(-maxVerticalRotationDeg, Math.min(maxVerticalRotationDeg, prev - velocityRef.current.y))
          );
        } else if (isSpinning) {
          setRotY((prev) => (prev + autoRotateSpeed) % 360);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpinning, autoRotateSpeed, maxVerticalRotationDeg]);

  // Drag handlers using Pointer Events
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    velocityRef.current = { x: 0, y: 0 };
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const nextRotY = dragStartRef.current.rotY + dx * 0.35;
    const nextRotX = Math.max(
      -maxVerticalRotationDeg,
      Math.min(maxVerticalRotationDeg, dragStartRef.current.rotX - dy * 0.25)
    );

    velocityRef.current = {
      x: (dx * 0.35 - (nextRotY - rotY)) * 0.2,
      y: (dy * 0.25 - (rotX - nextRotX)) * 0.2
    };

    setRotY(nextRotY);
    setRotX(nextRotX);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Dome geometry distribution math
  const rows = 3;
  const latitudes = [-20, 0, 20];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Dome Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="dome-gallery-container bg-transparent overflow-hidden"
        style={{ perspective: '1100px' }}
      >
        {/* Optional Dome Backdrop Glow */}
        {overlayBlurColor && overlayBlurColor !== 'transparent' && (
          <div
            className="absolute inset-0 pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle at center, transparent 20%, ${overlayBlurColor} 75%, rgba(2, 6, 23, 0.98) 100%)`
            }}
          />
        )}

        {/* 3D Dome Stage */}
        <div
          className="dome-stage"
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`
          }}
        >
          {itemList.map((item, index) => {
            const rowIndex = index % rows;
            const colIndex = Math.floor(index / rows);
            const itemsInRow = Math.ceil(itemList.length / rows);

            const phi = latitudes[rowIndex] || 0;
            const theta = (colIndex / Math.max(1, itemsInRow)) * 360 + (rowIndex % 2 === 1 ? 180 / itemsInRow : 0);

            return (
              <div
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(item);
                  if (onItemClick) onItemClick(item, index);
                }}
                className="dome-tile w-[200px] xs:w-[240px] sm:w-[280px] h-[130px] xs:h-[150px] sm:h-[180px] bg-slate-900 border border-amber-300/40 shadow-xl hover:border-amber-500"
                style={{
                  marginTop: '-90px',
                  marginLeft: '-140px',
                  transform: `rotateY(${theta}deg) rotateX(${phi}deg) translateZ(${minRadius}px)`
                }}
              >
                <img src={item.src} alt={item.alt || item.title || 'Impact gallery image'} />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end text-white">
                  {item.category && (
                    <span className="self-start text-[9px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full mb-1 shadow-2xs">
                      {item.category}
                    </span>
                  )}
                  {item.title && (
                    <h4 className="text-xs sm:text-sm font-extrabold line-clamp-1 drop-shadow-md">
                      {item.title}
                    </h4>
                  )}
                  {item.location && (
                    <p className="text-[10px] text-amber-200 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{item.location}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Controls Bar */}
        <div className="dome-controls text-slate-800 text-xs font-bold shadow-md">
          <button
            type="button"
            onClick={() => setIsSpinning(!isSpinning)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer"
          >
            {isSpinning ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-amber-600" />}
            <span>{isSpinning ? 'Pause' : 'Spin'}</span>
          </button>

          <div className="h-3 w-px bg-slate-300" />

          <button
            type="button"
            onClick={() => {
              setRotX(-4);
              setRotY(0);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full hover:bg-amber-100 text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset</span>
          </button>
        </div>

        {/* Directional Manual Arrows */}
        <button
          type="button"
          onClick={() => setRotY((prev) => prev - 45)}
          aria-label="Rotate dome left"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-amber-500 text-slate-900 hover:text-white border border-amber-300/60 shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setRotY((prev) => prev + 45)}
          aria-label="Rotate dome right"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/90 hover:bg-amber-500 text-slate-900 hover:text-white border border-amber-300/60 shadow-lg backdrop-blur-md transition-all cursor-pointer z-20"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Item Zoom Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative max-w-2xl w-full bg-slate-900 border border-amber-400/30 rounded-2xl overflow-hidden shadow-2xl text-white">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-white hover:bg-amber-500 transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-950">
              <img
                src={selectedItem.src}
                alt={selectedItem.title || 'Impact story'}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              {selectedItem.category && (
                <span className="inline-block bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {selectedItem.category}
                </span>
              )}
              {selectedItem.title && <h3 className="text-lg font-extrabold">{selectedItem.title}</h3>}
              <div className="flex items-center gap-4 text-xs text-slate-300">
                {selectedItem.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> {selectedItem.location}
                  </span>
                )}
                {selectedItem.date && <span>{selectedItem.date}</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DomeGallery;
