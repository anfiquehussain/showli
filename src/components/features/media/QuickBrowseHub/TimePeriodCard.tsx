import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { useDiscoverQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

// Time period metadata for premium timeline styling
const ERA_METADATA: Record<string, { label: string; desc: string; colors: { start: string; end: string; glow: string } }> = {
  '2026': { label: 'This Year', desc: 'Releasing This Year', colors: { start: '#ec4899', end: '#8b5cf6', glow: '236,72,153' } },
  '2025': { label: 'Last Year', desc: 'Recent Blockbusters', colors: { start: '#10b981', end: '#06b6d4', glow: '16,185,129' } },
  '2024': { label: 'Modern Hits', desc: 'Modern Favorites', colors: { start: '#f97316', end: '#f59e0b', glow: '249,115,22' } },
  '2023': { label: 'Recent Gems', desc: 'Critically Acclaimed', colors: { start: '#eab308', end: '#f97316', glow: '234,179,8' } },
  '2019': { label: 'Modern Peak', desc: 'Joker & Parasite Era', colors: { start: '#8b5cf6', end: '#ec4899', glow: '139,92,246' } },
  '2008': { label: 'Blockbuster Dawn', desc: 'The Dark Knight Era', colors: { start: '#ff007f', end: '#4b0082', glow: '255,0,127' } },
  '1999': { label: 'Millennium Rise', desc: 'Matrix & Fight Club', colors: { start: '#00f2fe', end: '#4facfe', glow: '0,242,254' } },
  '1994': { label: 'Golden Classics', desc: 'Pulp Fiction & Shawshank', colors: { start: '#d4af37', end: '#ffc125', glow: '212,175,55' } },
};

interface TimePeriodCardProps {
  id: string;
  name: string;
  type: string;
  value: string;
  onClick: () => void;
}

export const TimePeriodCard = ({ id, name, type, value, onClick }: TimePeriodCardProps) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const discoverParams: Record<string, string | number> = {
    sort_by: 'popularity.desc',
    page: 1,
  };

  if (type === 'year') {
    discoverParams.primary_release_year = value;
  } else if (id === 'Classics') {
    discoverParams['primary_release_date.lte'] = '1989-12-31';
  } else {
    const startYear = id.replace('s', '');
    const endYear = Number(startYear) + 9;
    discoverParams['primary_release_date.gte'] = `${startYear}-01-01`;
    discoverParams['primary_release_date.lte'] = `${endYear}-12-31`;
  }

  const { data, isLoading } = useDiscoverQuery({
    type: 'movie',
    params: discoverParams,
  });

  const featuredMovie = data?.results?.[0];
  const backdropUrl = getTmdbImageUrl(featuredMovie?.backdrop_path, 'w500');
  const movieTitle = featuredMovie
    ? ('title' in featuredMovie ? featuredMovie.title : ('name' in featuredMovie ? featuredMovie.name : ''))
    : '';
  const metadata = ERA_METADATA[id] || { label: 'Cinema Era', desc: 'Browse Movies', colors: { start: '#f43f5e', end: '#ec4899', glow: '244,63,94' } };

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className="relative flex flex-col items-start justify-between p-4 h-36 rounded-2xl border border-white/5 hover:border-white/10 transition-colors duration-300 group shrink-0 w-52 sm:w-60 bg-neutral-900/60 hover:bg-neutral-900/80 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-left overflow-hidden select-none"
      style={{
        // Set coordinates for radial gradient hover effect
        ['--x' as string]: `${coords.x}px`,
        ['--y' as string]: `${coords.y}px`,
      } as React.CSSProperties}
    >
      {/* Background Image wrapped in a cropped container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-0">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        ) : backdropUrl ? (
          <>
            <img
              src={backdropUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 group-hover:scale-110 transition-[opacity,transform] duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-black/35" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-20 bg-palette-rose" />
        )}
      </div>

      {/* Decorative vertical film sprocket strip on the left edge */}
      <div className="absolute left-2.5 top-0 bottom-0 flex flex-col justify-between py-3.5 opacity-15 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none z-10">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="w-1.5 h-2 rounded-[1px] bg-white border border-white/20" />
        ))}
      </div>

      {/* Decorative subtle ambient card glow in the background */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background: `radial-gradient(100px circle at var(--x) var(--y), rgba(${metadata.colors.glow}, 0.15), transparent 80%)`,
        }}
      />

      {/* Header section: Era Label */}
      <div className="pl-3.5 z-10 flex flex-col pointer-events-none">
        <span 
          className="text-[8px] font-black uppercase tracking-[0.2em] transition-colors duration-300"
          style={{ color: metadata.colors.start }}
        >
          {metadata.label}
        </span>
      </div>

      {/* Center/Bottom section: Large Title & Description */}
      <div className="pl-3.5 pr-8 z-10 flex flex-col pointer-events-none mt-auto w-full">
        <span 
          className="text-2xl sm:text-3xl font-black tracking-tighter bg-clip-text text-transparent transition-colors duration-300"
          style={{ 
            backgroundImage: `linear-gradient(to bottom right, #ffffff 30%, ${metadata.colors.start} 100%)`
          }}
        >
          {name}
        </span>
        <span className="text-[9px] text-muted-foreground mt-0.5 font-medium group-hover:text-white/70 transition-colors line-clamp-1">
          {metadata.desc}
        </span>
        {movieTitle && (
          <div className="mt-1.5 w-full text-[9px] font-semibold text-brand-secondary/90 transition-colors duration-300 drop-shadow-[0_1.5px_4px_rgba(0,0,0,1)] truncate">
            <span className="truncate font-semibold text-white/50 group-hover:text-white transition-colors">{movieTitle}</span>
          </div>
        )}
      </div>

      {/* Play/arrow indicator at bottom-right */}
      <div className="absolute bottom-4 right-4 p-1.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white group-hover:border-white transition-colors duration-300 group-hover:scale-105 pointer-events-none z-10">
        <Play 
          className="w-2.5 h-2.5 text-white fill-white/20 group-hover:text-black group-hover:fill-black transition-colors" 
        />
      </div>

      {/* Ambient gradient outline/border glow */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none border border-transparent z-10"
        style={{
          boxShadow: `inset 0 0 12px rgba(${metadata.colors.glow}, 0.5)`
        }}
      />
    </motion.button>
  );
};

export default TimePeriodCard;
