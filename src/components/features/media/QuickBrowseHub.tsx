import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Ghost, 
  Heart, 
  Rocket, 
  Compass,
  Smile,
  Shield,
  Clapperboard,
  Flame,
  Sparkles,
  Music,
  Play
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useDiscoverQuery, useGetAvailableWatchProvidersQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import ScrollContainer from '@/components/patterns/ScrollContainer';

// Genres
const CATEGORIES = [
  { id: 'action', name: 'Action', icon: Zap, color: 'bg-palette-orange/10 text-palette-orange', genreId: 28 },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: 'bg-palette-cyan/10 text-palette-cyan', genreId: 12 },
  { id: 'comedy', name: 'Comedy', icon: Smile, color: 'bg-palette-yellow/10 text-palette-yellow', genreId: 35 },
  { id: 'drama', name: 'Drama', icon: Clapperboard, color: 'bg-palette-indigo/10 text-palette-indigo', genreId: 18 },
  { id: 'horror', name: 'Horror', icon: Ghost, color: 'bg-palette-violet/10 text-palette-violet', genreId: 27 },
  { id: 'romance', name: 'Romance', icon: Heart, color: 'bg-palette-pink/10 text-palette-pink', genreId: 10749 },
  { id: 'scifi', name: 'Sci-Fi', icon: Rocket, color: 'bg-palette-blue/10 text-palette-blue', genreId: 878 },
  { id: 'crime', name: 'Crime', icon: Shield, color: 'bg-palette-rose/10 text-palette-rose', genreId: 80 },
  { id: 'fantasy', name: 'Fantasy', icon: Sparkles, color: 'bg-palette-lime/10 text-palette-lime', genreId: 14 },
  { id: 'thriller', name: 'Thriller', icon: Flame, color: 'bg-palette-amber/10 text-palette-amber', genreId: 53 },
  { id: 'animation', name: 'Animation', icon: Play, color: 'bg-palette-orange/10 text-palette-orange', genreId: 16 },
  { id: 'music', name: 'Music', icon: Music, color: 'bg-palette-emerald/10 text-palette-emerald', genreId: 10402 },
];

// Popular Production Companies
const POPULAR_COMPANIES = [
  { id: 420, name: 'Marvel Studios', logoPath: '/hUzeosd33nzE5MCNsZxCGEKTXaQ.png' },
  { id: 3, name: 'Pixar', logoPath: '/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png' },
  { id: 41077, name: 'A24', logoPath: '/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png' },
  { id: 10342, name: 'Studio Ghibli', logoPath: '/uFuxPEZRUcBTEiYIxjHJq62Vr77.png' },
  { id: 174, name: 'Warner Bros.', logoPath: '/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png' },
  { id: 2, name: 'Walt Disney', logoPath: '/wdrCwmRnLFJhEoH8GSfymY85KHT.png' },
  { id: 33, name: 'Universal', logoPath: '/8lvHyhjr8oUKOOy2dKXoALWKdp0.png' },
  { id: 4, name: 'Paramount', logoPath: '/jay6WcMgagAklUt7i9Euwj1pzTF.png' },
  { id: 5, name: 'Columbia', logoPath: '/71BqEFAF4V3qjjMPCpLuyJFB9A.png' },
  { id: 7, name: 'DreamWorks', logoPath: '/zcKhWbxFJ4CohZ9dLBMxmOArTVn.png' },
  { id: 12, name: 'New Line', logoPath: '/2ycs64eqV5rqKYHyQK0GVoKGvfX.png' },
  { id: 14, name: 'Miramax', logoPath: '/m6AHu84oZQxvq7n1rsvMNJIAsMu.png' },
  { id: 21, name: 'MGM', logoPath: '/usUnaYV6hQnlVAXP6r4HwrlLFPG.png' },
  { id: 34, name: 'Sony Pictures', logoPath: '/fl0GumpYvcu7cTHZlNNAMs8heP6.png', invertLogo: true },
  { id: 923, name: 'Legendary', logoPath: '/5UQsZrfbfG2dYJbx8DxfoTr2Bvu.png' },
  { id: 1632, name: 'Lionsgate', logoPath: '/cisLn1YAUuptXVBa0xjq7ST9cH0.png' },
  { id: 3172, name: 'Blumhouse', logoPath: '/rzKluDcRkIwHZK2pHsiT667A2Kw.png' },
  { id: 3268, name: 'HBO', logoPath: '/tuomPhY2UtuPTqqFnKMVHvSb724.png' },
  { id: 10146, name: 'Focus Features', logoPath: '/xnFIOeq5cKw09kCWqV7foWDe4AA.png' },
  { id: 288, name: 'BBC Film', logoPath: '/aW0IpM9d4Zjj978EqgDVSxXXhTj.png' },
  { id: 41, name: 'Orion', logoPath: '/em0rOXVRu3qprWZCx58uDDV2fze.png' },
  { id: 43, name: 'Searchlight', logoPath: '/4RgIPr55kBakgupWkzdDxqXJEqr.png' },
  { id: 56, name: 'Amblin', logoPath: '/cEaxANEisCqeEoRvODv2dO1I0iI.png' },
  { id: 559, name: 'TriStar', logoPath: '/eC0bWHVjnjUducyA6YFoEFqnPMC.png' },
];

// Popular Countries
const POPULAR_COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
];

// Popular Languages
const POPULAR_LANGUAGES = [
  { code: 'en', name: 'English', label: 'EN' },
  { code: 'es', name: 'Spanish', label: 'ES' },
  { code: 'ja', name: 'Japanese', label: 'JA' },
  { code: 'ko', name: 'Korean', label: 'KO' },
  { code: 'hi', name: 'Hindi', label: 'HI' },
  { code: 'fr', name: 'French', label: 'FR' },
  { code: 'it', name: 'Italian', label: 'IT' },
  { code: 'de', name: 'German', label: 'DE' },
];

// Years & Decades
const POPULAR_YEARS = [
  { id: '2026', name: '2026', type: 'year', value: '2026' },
  { id: '2025', name: '2025', type: 'year', value: '2025' },
  { id: '2024', name: '2024', type: 'year', value: '2024' },
  { id: '2023', name: '2023', type: 'year', value: '2023' },
  { id: '2010s', name: '2010s', type: 'decade', value: '2015' }, // Representative year for discover background
  { id: '2000s', name: '2000s', type: 'decade', value: '2005' },
  { id: '1990s', name: '1990s', type: 'decade', value: '1995' },
  { id: 'Classics', name: 'Classics', type: 'decade', value: '1975' },
];

interface DynamicCardProps {
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
  logoPath?: string;
  pillLabel?: string;
  flagEmoji?: string;
  discoverParams: Record<string, string | number>;
  onClick: () => void;
  color?: string;
}

const DynamicCard = ({ 
  name, 
  icon: Icon, 
  logoPath, 
  pillLabel, 
  flagEmoji, 
  discoverParams, 
  onClick, 
  color = 'bg-brand-primary/10 text-brand-primary' 
}: DynamicCardProps) => {
  const { data, isLoading } = useDiscoverQuery({
    type: 'movie',
    params: {
      ...discoverParams,
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
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-4 h-28 rounded-2xl border border-white/5 hover:border-brand-primary/30 transition-colors overflow-hidden group shrink-0 w-36 sm:w-44 text-center bg-card/20 cursor-pointer"
    >
      {/* Background Image with overlay */}
      {isLoading ? (
        <div className="absolute inset-0 bg-white/5 animate-pulse" />
      ) : backdropUrl ? (
        <>
          <img
            src={backdropUrl}
            alt={movieTitle || name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-20 group-hover:opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/50 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 opacity-5 ${color.split(' ')[0]}`} />
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        {logoPath ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden mb-1.5 border border-white/10 group-hover:border-brand-primary/30 transition-colors bg-black/40 p-1 flex items-center justify-center">
            <img 
              src={`https://image.tmdb.org/t/p/w92${logoPath}`}
              alt={name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : flagEmoji ? (
          <span className="text-2xl mb-1.5 select-none leading-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {flagEmoji}
          </span>
        ) : pillLabel ? (
          <div className="px-2 py-0.5 rounded-lg bg-brand-primary/20 text-brand-primary text-[10px] font-black tracking-widest mb-2 border border-brand-primary/30">
            {pillLabel}
          </div>
        ) : Icon ? (
          <div className={`p-2 rounded-xl mb-1.5 transition-colors duration-300 group-hover:bg-brand-primary/20 ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        ) : null}

        <span className="text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-brand-primary transition-colors">
          {name}
        </span>
        {movieTitle && (
          <span className="text-[9px] text-muted-foreground mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {movieTitle}
          </span>
        )}
      </div>
    </motion.button>
  );
};

interface ProviderCardProps {
  name: string;
  logoPath?: string;
  onClick: () => void;
}

const ProviderCard = ({ name, logoPath, onClick }: ProviderCardProps) => {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-2 shrink-0 w-20 sm:w-24 text-center cursor-pointer group"
    >
      {logoPath ? (
        <div className="w-12 h-12 rounded-xl overflow-hidden mb-2 border border-white/5 group-hover:border-brand-primary/50 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
          <img 
            src={`https://image.tmdb.org/t/p/w92${logoPath}`}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2 border border-brand-primary/20">
          <Play className="w-6 h-6" />
        </div>
      )}
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-brand-primary truncate w-full px-1 transition-colors">
        {name}
      </span>
    </motion.button>
  );
};

interface StudioCardProps {
  name: string;
  logoPath: string;
  invertLogo?: boolean;
  onClick: () => void;
}

const StudioCard = ({ name, logoPath, invertLogo, onClick }: StudioCardProps) => {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative flex flex-col items-center justify-center p-2 shrink-0 w-32 sm:w-36 text-center cursor-pointer group"
    >
      {logoPath ? (
        <div className="w-24 h-14 flex items-center justify-center mb-2 bg-linear-to-b from-white to-neutral-100 rounded-xl p-2.5 shadow-[0_4px_12px_rgba(0,0,0,0.3)] border border-white/20 group-hover:scale-105 transition-transform duration-300">
          <img 
            src={`https://image.tmdb.org/t/p/w185${logoPath}`}
            alt={name}
            className={`max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 ${
              invertLogo ? 'invert' : ''
            }`}
          />
        </div>
      ) : null}
      <span className="text-[10px] font-medium text-muted-foreground group-hover:text-brand-primary truncate w-full px-1 transition-colors">
        {name}
      </span>
    </motion.button>
  );
};

const COUNTRY_FLAG_GRADIENTS: Record<string, string> = {
  US: 'from-flag-us-blue via-neutral-100 to-flag-us-red',
  GB: 'from-flag-gb-blue via-neutral-100 to-flag-gb-red',
  JP: 'from-neutral-100 via-neutral-100 to-flag-jp-red',
  KR: 'from-flag-kr-blue via-neutral-100 to-flag-kr-red',
  IN: 'from-flag-in-saffron via-neutral-100 to-flag-in-green',
  FR: 'from-flag-fr-blue via-neutral-100 to-flag-fr-red',
  ES: 'from-flag-es-red via-flag-es-yellow to-flag-es-red',
  DE: 'from-neutral-950 via-flag-de-red to-flag-de-yellow',
};

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

const CountryCard = ({ code, name, onClick }: CountryCardProps) => {
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
  const colors = COUNTRY_FLAG_COLORS[code] || { start: '#10b981', end: '#06b6d4' };
  const gradId = `flag-border-grad-${code}`;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="relative flex flex-col items-start justify-end p-4 h-32 rounded-2xl border border-white/5 transition-all duration-300 group shrink-0 w-48 sm:w-56 bg-card/20 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* Background Image wrapped in a cropped container */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        {isLoading ? (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        ) : backdropUrl ? (
          <>
            <img
              src={backdropUrl}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent transition-opacity duration-300" />
          </>
        ) : (
          <div className="absolute inset-0 opacity-20 bg-palette-emerald" />
        )}
      </div>

      {/* SVG drawing border trace animation outside the card perimeter */}
      <svg className="absolute -inset-[6px] w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none z-20" fill="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            {colors.middle && <stop offset="50%" stopColor={colors.middle} />}
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="3"
          width="calc(100% - 6px)"
          height="calc(100% - 6px)"
          rx="17"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          className="transition-all duration-1000 ease-in-out"
          style={{
            strokeDasharray: '800',
            strokeDashoffset: isTouchDevice || isHovered ? '0' : '800',
          }}
        />
      </svg>

      {/* Content overlay - only country name on the bottom */}
      <div className="relative z-10 flex flex-col items-start w-full pointer-events-none mb-1">
        <span className="text-xs font-black uppercase tracking-widest text-foreground group-hover:text-white transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
          {name}
        </span>
      </div>
    </motion.button>
  );
};

const QuickBrowseHub = () => {
  const navigate = useNavigate();
  
  // Fetch watch provider data to get logo paths
  const { data: providersData } = useGetAvailableWatchProvidersQuery({ 
    type: 'movie', 
    region: 'US' 
  });

  return (
    <section className="space-y-10 py-4">
      {/* 1. Genres Section */}
      <div className="space-y-4">
        <div className="flex flex-col px-1">
          <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            Browse Genres
          </h2>
          <p className="text-[10px] text-muted-foreground">Find films tailored to your favorite styles.</p>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {CATEGORIES.map((cat) => (
            <DynamicCard
              key={cat.id}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              discoverParams={{ with_genres: cat.genreId }}
              onClick={() => navigate(`/browse?genre=${cat.genreId}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 2. Streaming Providers Section */}
      <div className="space-y-4">
        <div className="flex flex-col px-1">
          <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-brand-secondary rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            Streaming Services
          </h2>
          <p className="text-[10px] text-muted-foreground">Explore what is playing on your favorite platforms.</p>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {(providersData?.results
            ? [...providersData.results]
                .sort((a, b) => a.display_priority - b.display_priority)
                .slice(0, 24)
            : []
          ).map((provider) => (
            <ProviderCard
              key={provider.provider_id}
              name={provider.provider_name}
              logoPath={provider.logo_path}
              onClick={() => navigate(`/browse?provider=${provider.provider_id}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 3. Production Companies Section */}
      <div className="space-y-4">
        <div className="flex flex-col px-1">
          <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-brand-accent rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
            Studios & Brands
          </h2>
          <p className="text-[10px] text-muted-foreground">Browse masterpieces from popular production houses.</p>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {POPULAR_COMPANIES.map((company) => (
            <StudioCard
              key={company.id}
              name={company.name}
              logoPath={company.logoPath}
              invertLogo={company.invertLogo}
              onClick={() => navigate(`/browse?company=${company.id}&companyName=${encodeURIComponent(company.name)}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 4. Origin Countries Section */}
      <div className="space-y-4">
        <div className="flex flex-col px-1">
          <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-palette-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            Origin Countries
          </h2>
          <p className="text-[10px] text-muted-foreground">Discover stories from around the globe.</p>
        </div>
        <ScrollContainer className="gap-4 py-2 px-1.5" showButtons={true}>
          {POPULAR_COUNTRIES.map((country) => (
            <CountryCard
              key={country.code}
              code={country.code}
              name={country.name}
              onClick={() => navigate(`/browse?country=${country.code}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 5. Languages Section */}
      <div className="space-y-4">
        <div className="flex flex-col px-1">
          <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-palette-amber rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            Original Languages
          </h2>
          <p className="text-[10px] text-muted-foreground">Filter cinema by original audio language.</p>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {POPULAR_LANGUAGES.map((lang) => (
            <DynamicCard
              key={lang.code}
              name={lang.name}
              pillLabel={lang.label}
              discoverParams={{ with_original_language: lang.code }}
              onClick={() => navigate(`/browse?language=${lang.code}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 6. Release Years & Decades Section */}
      <div className="space-y-4">
        <div className="flex flex-col px-1">
          <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1 h-4 bg-palette-rose rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
            Time Periods
          </h2>
          <p className="text-[10px] text-muted-foreground">Travel back in time to different cinema eras.</p>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {POPULAR_YEARS.map((year) => {
            // Note: Classics searches pre-1990 movies
            const backgroundParams = year.type === 'year'
              ? { primary_release_year: year.value }
              : { primary_release_year: year.value }; // use representative year for backdrop search query
              
            return (
              <DynamicCard
                key={year.id}
                name={year.name}
                color="bg-palette-rose/10 text-palette-rose"
                discoverParams={backgroundParams}
                onClick={() => {
                  if (year.type === 'year') {
                    navigate(`/browse?year=${year.value}`);
                  } else if (year.id === 'Classics') {
                    navigate(`/browse?primary_release_date.lte=1989-12-31`);
                  } else {
                    const startYear = year.id.replace('s', '');
                    const endYear = Number(startYear) + 9;
                    navigate(`/browse?primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${endYear}-12-31`);
                  }
                }}
              />
            );
          })}
        </ScrollContainer>
      </div>
    </section>
  );
};

export default QuickBrowseHub;
