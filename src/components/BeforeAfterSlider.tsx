import React, { useRef, useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeImageClass?: string;
  afterImageClass?: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function BeforeAfterSlider({ 
  beforeImage, 
  afterImage,
  beforeImageClass = '',
  afterImageClass = '',
  beforeLabel = 'Before',
  afterLabel = 'After'
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement> | PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointermove', handlePointerMove as any);
    } else {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove as any);
    }

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove as any);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] max-h-[70vh] rounded-[40px] overflow-hidden cursor-crosshair select-none bg-[#2D2A26] shadow-2xl aspect-auto"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${afterImageClass}`}
      />
      
      {/* Before Image (Foreground, clipped) */}
      <img
        src={beforeImage}
        alt={beforeLabel}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none ${beforeImageClass}`}
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      />

      {/* Slider Line */}
      <div
        className="absolute inset-y-0 w-[2px] bg-white cursor-ew-resize hover:bg-white/90 transition-colors z-10"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        {/* Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-[2px] h-4 bg-[#7C7464]"></div>
            <div className="w-[2px] h-4 bg-[#7C7464]"></div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 z-20 pointer-events-none">
        <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full text-white text-[10px] uppercase tracking-widest font-bold animate-pulse-slow">
          {beforeLabel} {sliderPosition < 90 && "→"}
        </div>
      </div>
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
        <div className="bg-black/30 backdrop-blur-md px-4 py-1 rounded-full text-white text-[10px] uppercase tracking-widest font-bold">
          {sliderPosition > 10 && "←"} {afterLabel}
        </div>
      </div>
    </div>
  );
}
