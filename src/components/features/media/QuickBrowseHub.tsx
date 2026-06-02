import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Ghost, 
  Heart, 
  Rocket, 
  Globe, 
  Languages, 
  Calendar, 
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
import { useDiscoverQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import ScrollContainer from '@/components/patterns/ScrollContainer';

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

const METADATA_LINKS = [
  { id: 'countries', name: 'Countries', icon: Globe, path: '/browse?focus=countries' },
  { id: 'languages', name: 'Languages', icon: Languages, path: '/browse?focus=languages' },
  { id: 'upcoming', name: '2024 Releases', icon: Calendar, path: '/browse?year=2024' },
  { id: 'explore', name: 'Explore All', icon: Compass, path: '/browse' },
];

interface CategoryCardProps {
  cat: typeof CATEGORIES[number];
  onClick: () => void;
}

const CategoryCard = ({ cat, onClick }: CategoryCardProps) => {
  const { data, isLoading } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_genres: cat.genreId,
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
            alt={movieTitle || cat.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-20 group-hover:opacity-30"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/50 to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 opacity-5 ${cat.color.split(' ')[0]}`} />
      )}

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full">
        <div className={`p-2 rounded-xl mb-1.5 transition-colors duration-300 group-hover:bg-brand-primary/20 ${cat.color}`}>
          <cat.icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-foreground group-hover:text-brand-primary transition-colors">
          {cat.name}
        </span>
        {movieTitle && (
          <span className="text-[9px] text-muted-foreground mt-1 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Featuring: {movieTitle}
          </span>
        )}
      </div>
    </motion.button>
  );
};

const QuickBrowseHub = () => {
  const navigate = useNavigate();

  return (
    <section className="space-y-6 py-8">
      <div className="flex flex-col">
        <h2 className="text-base md:text-lg font-bold text-foreground uppercase tracking-wider">Explore Collections</h2>
        <p className="text-xs text-muted-foreground">Find movies and shows by genre or origin.</p>
      </div>

      {/* Genre Horizontal Scroll */}
      <ScrollContainer className="gap-3 pb-2" showButtons={true}>
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onClick={() => navigate(`/browse?genre=${cat.genreId}`)}
          />
        ))}
      </ScrollContainer>

      {/* Secondary Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METADATA_LINKS.map((link) => (
          <motion.button
            key={link.id}
            whileHover={{ x: 4 }}
            onClick={() => navigate(link.path)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
              <link.icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-foreground">{link.name}</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
};

export default QuickBrowseHub;
