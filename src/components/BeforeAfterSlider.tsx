import React, { useState, useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  title: string;
  barber: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after, title, barber }) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0 - 100)
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging.current) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const stopDragging = () => {
    isDragging.current = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopDragging);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', stopDragging);
  };

  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDragging);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', stopDragging);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[400px] md:h-[500px] bg-[#171717] overflow-hidden group select-none border border-white/5 rounded-sm"
    >
      {/* Before Image (Left Base) */}
      <img 
        src={before} 
        alt="Before grooming" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none filter grayscale opacity-90 transition-all duration-300 group-hover:scale-[1.02]"
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-4 left-4 z-10 bg-black/60 px-3 py-1 text-[11px] tracking-widest uppercase font-space text-[#A7A7A7] border border-white/5 backdrop-blur-md">
        BEFORE
      </div>

      {/* After Image (Right Clipped Overlay) */}
      <div 
        className="absolute inset-y-0 right-0 left-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
      >
        <img 
          src={after} 
          alt="After grooming" 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300 group-hover:scale-[1.02]"
          style={{ width: containerRef.current?.getBoundingClientRect().width || '100%', maxWidth: 'none' }}
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 right-4 z-10 bg-gold/90 px-3 py-1 text-[11px] tracking-widest uppercase font-space text-[#0F0F0F] font-bold shadow-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AFTER
        </div>
      </div>

      {/* Slider Line Handler */}
      <div 
        className="absolute inset-y-0 z-30 w-[2px] bg-gold cursor-ew-resize flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(200,155,60,0.5)]"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={startDragging}
        onTouchStart={startDragging}
      >
        <div className="w-8 h-8 rounded-full bg-[#0F0F0F] border-2 border-gold flex items-center justify-center text-gold shadow-lg hover:scale-110 active:scale-95 transition-transform">
          <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
          </svg>
        </div>
      </div>

      {/* Overlay Details Info Banner */}
      <div className="absolute bottom-0 inset-x-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
        <h4 className="font-bebas text-2xl tracking-wider text-[#F8F8F8] mb-1">{title}</h4>
        <p className="text-xs text-[#A7A7A7] tracking-wider font-sans">
          Sculpted by <span className="text-gold font-medium">{barber}</span>
        </p>
      </div>

      {/* Direct Interactive Hint Banner */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="text-[10px] tracking-[0.2em] bg-[#0F0F0F]/60 text-white px-2 py-1 uppercase rounded">DRAG BAR LEFT / RIGHT</div>
      </div>
    </div>
  );
};
