import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Film, 
  Tv, 
  Sparkles, 
  Globe, 
  Heart, 
  TrendingUp, 
  Zap, 
  Star, 
  Play, 
  Rocket, 
  Ghost, 
  Clapperboard, 
  Music, 
  Shield, 
  Coffee, 
  Flame,
  RefreshCw,
  Compass
} from 'lucide-react';
import { 
  useGetDiscoveryContentQuery, 
  useGetCountriesQuery, 
  useGetLanguagesQuery, 
  useGetMovieGenresQuery, 
  useGetTVGenresQuery 
} from '@/api/media/mediaApi';
import { generateRandomDiscovery, type DiscoveryConfig } from '@/api/media/mediaDiscovery';
import MediaScroll from '@/components/patterns/MediaScroll';
import Button from '@/components/ui/Button';

// Icon mapping to handle dynamic icon selection from presets
const ICON_MAP = {
  Calendar,
  Film,
  Tv,
  Sparkles,
  Globe,
  Heart,
  TrendingUp,
  Zap,
  Star,
  Play,
  Rocket,
  Ghost,
  Clapperboard,
  Music,
  Shield,
  Coffee,
  Flame,
  Compass
};

/**
 * A single discovery row that fetches and displays content based on a config.
 */
const DiscoveryRow = ({ config }: { config: DiscoveryConfig }) => {
  const { data, isLoading } = useGetDiscoveryContentQuery({
    path: config.path,
    params: config.params
  });

  const IconComponent = ICON_MAP[config.icon as keyof typeof ICON_MAP] || Sparkles;

  // We only show the row if it has items or is loading
  if (!isLoading && (!data || data.results.length === 0)) return null;

  return (
    <MediaScroll 
      title={config.title} 
      icon={<IconComponent className="w-4 h-4" />} 
      items={data?.results || []} 
      isLoading={isLoading} 
    />
  );
};

const DiscoveryGrids = () => {
  const [selectedConfigs, setSelectedConfigs] = useState<DiscoveryConfig[]>([]);
  
  // Fetch official configurations from TMDb
  const { data: countries } = useGetCountriesQuery();
  const { data: languages } = useGetLanguagesQuery();
  const { data: movieGenresData } = useGetMovieGenresQuery();
  const { data: tvGenresData } = useGetTVGenresQuery();

  const shuffleDiscovery = () => {
    // Dynamically generate 10 fresh discovery rows using official TMDb data
    const freshRows = generateRandomDiscovery(
      10,
      movieGenresData?.genres || [],
      tvGenresData?.genres || [],
      languages || [],
      countries || []
    );
    setSelectedConfigs(freshRows);
  };

  // Initialize once configurations are loaded
  useEffect(() => {
    if (movieGenresData && tvGenresData && languages && countries && selectedConfigs.length === 0) {
      shuffleDiscovery();
    }
  }, [movieGenresData, tvGenresData, languages, countries]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h2 className="text-base md:text-xl font-bold text-primary text-gradient-primary">Curated for You</h2>
          <p className="text-[10px] md:text-sm text-muted-foreground">Fresh picks from around the globe.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={shuffleDiscovery}
          className="gap-2 group border-brand-primary/20 hover:border-brand-primary/50"
          disabled={!movieGenresData}
        >
          <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
          Shuffle
        </Button>
      </div>

      <div className="space-y-4">
        {selectedConfigs.length > 0 ? (
          selectedConfigs.map((config) => (
            <DiscoveryRow key={config.id} config={config} />
          ))
        ) : (
          // Skeleton loaders while initial configs are fetching
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="h-6 w-32 bg-card rounded" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="flex-shrink-0 w-28 md:w-40 aspect-[2/3] bg-card rounded-xl" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscoveryGrids;
