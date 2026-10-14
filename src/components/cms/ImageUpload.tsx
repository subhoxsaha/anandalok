import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, Loader2, AlertCircle, Scissors, Check, X, RotateCw, ZoomIn, Move } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export function compressAndConvertToBase64(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Selected file is not an image.'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions matching max boundaries
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string); // Fallback to raw base64
          return;
        }

        // Draw image and apply quality compression
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing.'));
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
  });
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label,
  id,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cropping State
  const [isCropping, setIsCropping] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const cropImageRef = useRef<HTMLImageElement>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const base64Url = await compressAndConvertToBase64(file, maxWidth, maxHeight, quality);
      onChange(base64Url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    setIsCropping(false);
  };

  // Reset cropping inputs on entering cropping view
  const startCropping = () => {
    setZoom(1);
    setRotation(0);
    setOffsetX(0);
    setOffsetY(0);
    setIsCropping(true);
  };

  const applyCrop = () => {
    const imgEl = cropImageRef.current;
    if (!imgEl) return;

    setIsProcessing(true);
    setError(null);

    // We generate the crop using canvas based on user zoom, offset, and rotation parameters
    setTimeout(() => {
      try {
        const canvas = document.createElement('canvas');
        // Standard crop target resolution
        const targetSize = Math.min(maxWidth, 600);
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Could not get 2D canvas context');
        }

        // Fill background with white just in case transparent png is cropped
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Calculate translation and rotation coordinates
        ctx.translate(targetSize / 2, targetSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom, zoom);

        // Obtain natural scale differences between preview container and actual image size
        // Draw the image centered, taking account of offsets
        const dWidth = targetSize;
        const dHeight = (imgEl.naturalHeight / imgEl.naturalWidth) * targetSize;

        ctx.drawImage(
          imgEl,
          -dWidth / 2 + offsetX,
          -dHeight / 2 + offsetY,
          dWidth,
          dHeight
        );

        const dataUrl = canvas.toDataURL('image/jpeg', Math.min(quality, 0.8));
        onChange(dataUrl);
        setIsCropping(false);
      } catch (err) {
        setError('Failed to crop image. Please try again.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const isBase64 = value.startsWith('data:image/');

  return (
    <div className="space-y-2 w-full max-w-full box-border overflow-hidden">
      {label && (
        <label className="font-bold text-slate-700 block mb-1 text-xs" htmlFor={id}>
          {label}
        </label>
      )}
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all flex flex-col items-center justify-center min-h-[140px] text-center w-full max-w-full box-border overflow-hidden ${
          isDragging 
            ? 'border-amber-500 bg-amber-50/10' 
            : isProcessing 
              ? 'border-slate-300 bg-slate-50/50' 
              : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
        }`}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-xs font-bold text-slate-700">Processing & optimizing image...</p>
          </div>
        ) : isCropping && value ? (
          /* Real-time Interactive Cropping Console */
          <div className="w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                <Scissors className="w-3 h-3 text-amber-700" /> Image Precision Crop
              </span>
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                title="Cancel cropping"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Crop Viewport Wrapper */}
            <div className="relative w-full max-w-[220px] min-[370px]:max-w-[260px] sm:max-w-[280px] h-[160px] min-[370px]:h-[180px] sm:h-[200px] mx-auto rounded-xl overflow-hidden border border-slate-300 bg-slate-900 flex items-center justify-center">
              {/* Bounding guide */}
              <div className="absolute inset-4 border-2 border-dashed border-amber-400/80 rounded-lg pointer-events-none z-10 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-1 left-1.5 text-[8px] font-black bg-amber-500 text-slate-900 px-1 rounded uppercase tracking-wider">Crop Area</div>
              </div>
              
              {/* Target Transform Preview Image */}
              <img
                ref={cropImageRef}
                src={value}
                alt="Crop template"
                className="max-w-none transition-transform pointer-events-none"
                style={{
                  width: '100%',
                  height: 'auto',
                  transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom}) rotate(${rotation}deg)`
                }}
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Precision Range Control Grid - Finer fitting layouts and typography */}
            <div className="space-y-2.5 text-[11px] sm:text-xs text-left text-slate-600 bg-slate-50/50 p-2 sm:p-2.5 rounded-xl border border-slate-200/60 w-full max-w-full box-border overflow-hidden">
              {/* Scale / Zoom */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="w-11 sm:w-14 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <ZoomIn className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Zoom
                </span>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-amber-600 h-1 bg-slate-200 rounded-lg cursor-pointer min-w-0"
                />
                <span className="w-8 text-right font-mono text-[9px] sm:text-[10px] font-black text-slate-700">{zoom.toFixed(1)}x</span>
              </div>

              {/* Rotate */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="w-11 sm:w-14 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <RotateCw className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Rotate
                </span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 accent-amber-600 h-1 bg-slate-200 rounded-lg cursor-pointer min-w-0"
                />
                <span className="w-8 text-right font-mono text-[9px] sm:text-[10px] font-black text-slate-700">{rotation}°</span>
              </div>

              {/* Horizontal Position */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="w-11 sm:w-14 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <Move className="w-3 sm:w-3.5 h-3 sm:h-3.5" /> Pan X
                </span>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={offsetX}
                  onChange={(e) => setOffsetX(Number(e.target.value))}
                  className="flex-1 accent-amber-600 h-1 bg-slate-200 rounded-lg cursor-pointer min-w-0"
                />
                <span className="w-8 text-right font-mono text-[9px] sm:text-[10px] font-black text-slate-700">{offsetX}px</span>
              </div>

              {/* Vertical Position */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                <span className="w-11 sm:w-14 font-bold text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-500 flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <Move className="w-3 sm:w-3.5 h-3 sm:h-3.5 rotate-90" /> Pan Y
                </span>
                <input
                  type="range"
                  min="-150"
                  max="150"
                  value={offsetY}
                  onChange={(e) => setOffsetY(Number(e.target.value))}
                  className="flex-1 accent-amber-600 h-1 bg-slate-200 rounded-lg cursor-pointer min-w-0"
                />
                <span className="w-8 text-right font-mono text-[9px] sm:text-[10px] font-black text-slate-700">{offsetY}px</span>
              </div>
            </div>

            {/* Trigger actions */}
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyCrop}
                className="px-3.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-[11px] font-black text-white cursor-pointer shadow-3xs flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Apply Crop
              </button>
            </div>
          </div>
        ) : value ? (
          <div className="w-full flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-white shadow-3xs">
              <img
                src={value}
                alt="Uploaded resource preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                {isBase64 ? 'Compressed Firebase Object' : 'External Image Resource'}
              </span>
              <p className="text-[11px] text-slate-500 truncate mt-1 leading-normal font-semibold">
                {isBase64 ? 'Image converted to highly optimized web-friendly base64 representation.' : value}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-[10px] font-black text-slate-700 bg-white transition-all cursor-pointer shadow-3xs"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={startCropping}
                  className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-[10px] font-black text-amber-800 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Scissors className="w-3 h-3 text-amber-700" /> Crop Image
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2 cursor-pointer outline-none focus:outline-none py-2"
          >
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <UploadCloud className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                Drag & drop or <span className="text-amber-800 underline">browse image</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal font-semibold">
                Supported formats: PNG, JPG, WEBP. Optimized automatically below 150KB.
              </p>
            </div>
          </button>
        )}

        {error && (
          <div className="absolute bottom-2 left-4 right-4 flex items-center gap-1.5 text-[10px] text-rose-600 font-semibold justify-center">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};
