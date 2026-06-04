import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDiscoverQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

// National flag hex color mapping for SVG border trace animation
const COUNTRY_FLAG_COLORS: Record<string, { start: string; middle?: string; end: string }> = {
  US: { start: '#0a3161', middle: '#fafafa', end: '#b31942' },
  GB: { start: '#00247d', middle: '#fafafa', end: '#cf142b' },
  JP: { start: '#fafafa', middle: '#fafafa', end: '#bc002d' },
  KR: { start: '#0047a0', middle: '#fafafa', end: '#cd2e3a' },
  IN: { start: '#ff9933', middle: '#fafafa', end: '#128807' },
  FR: { start: '#00209f', middle: '#fafafa', end: '#f62520' },
  ES: { start: '#aa151b', middle: '#f1bf00', end: '#aa151b' },
  DE: { start: '#09090b', middle: '#dd0000', end: '#ffcf00' },
};

interface CountryCardProps {
  code: string;
  name: string;
  onClick: () => void;
}

export const CountryCard = ({ code, name, onClick }: CountryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: none)');
    setIsTouchDevice(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const { data, isLoading } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_origin_country: code,
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const featuredMovie = data?.results?.[0];
  const backdropUrl = getTmdbImageUrl(featuredMovie?.backdrop_path, 'w500');
  const movieTitle = featuredMovie
    ? ('title' in featuredMovie ? featuredMovie.title : ('name' in featuredMovie ? featuredMovie.name : ''))
    : '';
  const colors = COUNTRY_FLAG_COLORS[code] || { start: '#10b981', end: '#06b6d4' };
  const gradId = `flag-border-grad-${code}`;

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative flex flex-col items-start justify-end p-4 h-32 rounded-2xl border border-white/5 transition-colors duration-300 group shrink-0 w-48 sm:w-56 bg-card/20 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-left"
    >
      {/* Background Image wrapped in a cropped container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        ) : backdropUrl ? (
          <>
            <motion.img
              src={backdropUrl}
              alt={name}
              animate={{
                scale: isHovered ? 1.1 : 1.0,
                opacity: isHovered ? 1.0 : 0.9,
              }}
              transition={{
                duration: 0.8,
                ease: [0.16, 1, 0.3, 1], // Premium easeOutExpo curve for buttery smooth scaling
              }}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-20 bg-palette-emerald" />
        )}
      </div>

      {/* SVG drawing border trace animation outside the card perimeter */}
      <svg className="absolute inset-[-6px] w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none z-20" fill="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            {colors.middle && <stop offset="50%" stopColor={colors.middle} />}
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <motion.rect
          x="3"
          y="3"
          width="calc(100% - 6px)"
          height="calc(100% - 6px)"
          rx="17"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          animate={{
            strokeDashoffset: isTouchDevice || isHovered ? 0 : 800,
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
          style={{
            strokeDasharray: '800',
          }}
        />
      </svg>

      {/* Content overlay - country name and featured movie */}
      <div className="relative z-10 flex flex-col items-start w-full pointer-events-none mb-1">
        <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          {name}
        </span>
        {movieTitle && (
          <div className="mt-1 w-full text-[9px] font-medium text-brand-secondary/90 transition-colors duration-300 drop-shadow-[0_1.5px_4px_rgba(0,0,0,1)] truncate">
            <span className="truncate font-semibold text-white/50 group-hover:text-white transition-colors">{movieTitle}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default CountryCard;
