import { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingPickerProps {
  value: number | null;
  onChange: (value: number) => void;
  max?: number;
}

const getRatingLabel = (val: number) => {
  if (val >= 10) return 'Masterpiece';
  if (val >= 9) return 'Amazing';
  if (val >= 8) return 'Great';
  if (val >= 7) return 'Good';
  if (val >= 6) return 'Decent';
  if (val >= 5) return 'Average';
  if (val >= 3) return 'Poor';
  return 'Bad';
};

const RatingPicker = ({ value, onChange, max = 10 }: RatingPickerProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-wrap items-center gap-1 md:gap-2">
        <div className="flex items-center gap-0.5 md:gap-1">
          {[...Array(max)].map((_, i) => {
            const starValue = i + 1;
            const isActive = hovered !== null ? starValue <= hovered : (value !== null && starValue <= value);
            
            return (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHovered(starValue)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onChange(starValue)}
                className="group relative transition-transform active:scale-90"
              >
                <Star
                  className={`w-3.5 h-3.5 md:w-5 md:h-5 transition-all duration-300 ${
                    isActive 
                      ? 'text-brand-primary fill-brand-primary drop-shadow-[0_0_12px_rgba(99,102,241,0.6)]' 
                      : 'text-white/10 fill-white/5 group-hover:text-white/40'
                  }`}
                />
              </button>
            );
          })}
        </div>
        
        <div className="ml-1 md:ml-3 flex flex-col justify-center min-w-[60px]">
          <div className="flex items-baseline gap-1">
            <span className="text-xs md:text-base font-black text-white leading-none">
              {hovered || value || 0}
            </span>
            <span className="text-[10px] text-white/40 font-medium">/ 10</span>
          </div>
          {(hovered || value) && (
            <span className="text-[8px] md:text-[10px] font-black text-brand-primary uppercase tracking-[0.15em] mt-0.5 animate-in fade-in slide-in-from-left-1">
              {getRatingLabel(hovered || value || 0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingPicker;
