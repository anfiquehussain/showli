import { motion } from 'framer-motion';
import { useDiscoverQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

// Language metadata for visual styling, native text, and color schemes
const LANGUAGE_METADATA: Record<string, {
  nativeName: string;
  char: string;
  colors: { start: string; end: string; glow: string };
  desc: string;
}> = {
  en: { nativeName: 'English', char: 'Aa', colors: { start: '#3b82f6', end: '#60a5fa', glow: '59,130,246' }, desc: 'Global Cinema' },
  es: { nativeName: 'Español', char: 'Ñ', colors: { start: '#ef4444', end: '#f59e0b', glow: '239,68,68' }, desc: 'Passionate Tales' },
  ml: { nativeName: 'മലയാളം', char: 'മ', colors: { start: '#10b981', end: '#f59e0b', glow: '16,185,129' }, desc: 'Vibrant Kerala Cinema' },
  ja: { nativeName: '日本語', char: 'あ', colors: { start: '#e11d48', end: '#f43f5e', glow: '225,29,72' }, desc: 'Masterful Artistry' },
  ko: { nativeName: '한국어', char: '한', colors: { start: '#0284c7', end: '#06b6d4', glow: '2,132,199' }, desc: 'Gripping Dramas' },
  hi: { nativeName: 'हिन्दी', char: 'अ', colors: { start: '#22d3ee', end: '#8b5cf6', glow: '34,211,238' }, desc: 'Epic Spectacles' },
  ta: { nativeName: 'தமிழ்', char: 'த', colors: { start: '#f97316', end: '#ef4444', glow: '249,115,22' }, desc: 'Kollywood Masterpieces' },
  tr: { nativeName: 'Türkçe', char: 'Ğ', colors: { start: '#ef4444', end: '#b91c1c', glow: '239,68,68' }, desc: 'Rich Historical Drama' },
  fa: { nativeName: 'فارسی', char: 'ف', colors: { start: '#0d9488', end: '#10b981', glow: '13,148,136' }, desc: 'Poetic Iranian Cinema' },
  tl: { nativeName: 'Filipino', char: 'Ph', colors: { start: '#3b82f6', end: '#06b6d4', glow: '59,130,246' }, desc: 'Compelling Narratives' },
  fr: { nativeName: 'Français', char: 'Ç', colors: { start: '#8b5cf6', end: '#ec4899', glow: '139,92,246' }, desc: 'Poetic Realism' },
  it: { nativeName: 'Italiano', char: 'It', colors: { start: '#10b981', end: '#34d399', glow: '16,185,129' }, desc: 'Neo-Realist Gems' },
  de: { nativeName: 'Deutsch', char: 'ß', colors: { start: '#f59e0b', end: '#fbbf24', glow: '245,158,11' }, desc: 'Classic Expression' },
};

interface LanguageCardProps {
  code: string;
  name: string;
  onClick: () => void;
}

export const LanguageCard = ({ code, name, onClick }: LanguageCardProps) => {
  const metadata = LANGUAGE_METADATA[code] || {
    nativeName: name,
    char: code.toUpperCase(),
    colors: { start: '#a855f7', end: '#ec4899', glow: '168,85,247' },
    desc: 'World Cinema',
  };

  const { data, isLoading } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_original_language: code,
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const featuredMovie = data?.results?.[0];
  const backdropUrl = getTmdbImageUrl(featuredMovie?.backdrop_path, 'w500');
  const movieTitle = featuredMovie
    ? ('title' in featuredMovie ? featuredMovie.title : ('name' in featuredMovie ? featuredMovie.name : ''))
    : '';

  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative flex flex-col justify-end p-4 h-40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors duration-300 group shrink-0 w-52 sm:w-60 bg-neutral-900/60 hover:bg-neutral-900/80 cursor-pointer text-left overflow-hidden select-none"
      style={{
        ['--hover-color' as any]: metadata.colors.start,
      }}
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
              className="absolute inset-0 w-full h-full object-cover opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-[opacity,transform] duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-black/35" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-15 bg-neutral-800" />
        )}
      </div>

      {/* Floating Cultural Character Watermark covering the background */}
      <div 
        className="absolute inset-0 flex items-center justify-center text-[10rem] sm:text-[12rem] font-black text-white/3 select-none pointer-events-none z-0 transition-all duration-500 ease-out group-hover:text-white/20 leading-none mobile-watermark"
        style={{
          fontFamily: code === 'ja' || code === 'ko' || code === 'hi' || code === 'ta' || code === 'ml' || code === 'fa' ? 'inherit' : '"Outfit", "Inter", sans-serif'
        }}
      >
        {metadata.char}
      </div>

      <style>{`
        @media (hover: none) {
          .mobile-watermark {
            color: rgba(255, 255, 255, 0.05) !important;
          }
        }
      `}</style>

      {/* Bottom section: Native Name, English Name, and Featured Title */}
      <div className="z-10 flex flex-col w-full mt-auto">
        <span 
          className="text-lg sm:text-xl font-extrabold tracking-tight transition-colors duration-300"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 40%, ${metadata.colors.start} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {metadata.nativeName}
        </span>
        
        <span className="text-[9px] text-muted-foreground font-medium group-hover:text-white/70 transition-colors">
          {name !== metadata.nativeName ? `${name} • ${metadata.desc}` : metadata.desc}
        </span>

        {movieTitle && (
          <div className="mt-1.5 w-full text-[9px] font-semibold text-brand-secondary/90 transition-colors duration-300 drop-shadow-[0_1.5px_4px_rgba(0,0,0,1)] truncate">
            <span className="truncate font-semibold text-white/40 group-hover:text-white/80 transition-colors">
              {movieTitle}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default LanguageCard;
