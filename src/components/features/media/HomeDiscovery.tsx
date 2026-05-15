import { useState, useEffect } from 'react';
import { 
  Sparkles, 
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
import { ICON_MAP } from '@/components/features/media/DiscoveryIcons';

/**
 * A single discovery row that fetches and displays content based on a config.
 */
const DiscoveryRow = ({ config }: { config: DiscoveryConfig }) => {
  const { data, isLoading } = useGetDiscoveryContentQuery({
    path: config.path,
    params: config.params
  });

  const IconComponent = (ICON_MAP as Record<string, React.ComponentType<{ className?: string }>>)[config.icon] || Sparkles;

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

const HomeDiscovery = () => {
  const [selectedConfigs, setSelectedConfigs] = useState<DiscoveryConfig[]>([]);
  
  const { data: countries } = useGetCountriesQuery();
  const { data: languages } = useGetLanguagesQuery();
  const { data: movieGenresData } = useGetMovieGenresQuery();
  const { data: tvGenresData } = useGetTVGenresQuery();

  const shuffleDiscovery = () => {
    const freshRows = generateRandomDiscovery(
      12, // More rows for discovery tab
      movieGenresData?.genres || [],
      tvGenresData?.genres || [],
      languages || [],
      countries || []
    );
    setSelectedConfigs(freshRows);
  };

  useEffect(() => {
    if (movieGenresData && tvGenresData && languages && countries && selectedConfigs.length === 0) {
      shuffleDiscovery();
    }
  }, [movieGenresData, tvGenresData, languages, countries]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center px-4">
        <div className="flex flex-col">
          <h2 className="text-base md:text-xl font-bold text-gradient-primary flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-primary" />
            Curated for You
          </h2>
          <p className="text-[10px] md:text-sm text-muted-foreground">Fresh picks from around the globe, shuffled daily.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={shuffleDiscovery}
          className="gap-2 group border-brand-primary/20 hover:border-brand-primary/50 rounded-xl"
          disabled={!movieGenresData}
        >
          <RefreshCw className="w-4 h-4 group-active:rotate-180 transition-transform duration-500" />
          <span className="hidden sm:inline">Shuffle</span>
        </Button>
      </div>

      <div className="space-y-4">
        {selectedConfigs.length > 0 ? (
          selectedConfigs.map((config) => (
            <DiscoveryRow key={config.id} config={config} />
          ))
        ) : (
          [...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-4 py-4">
              <div className="h-6 w-32 bg-card/50 rounded" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, j) => (
                  <div key={j} className="shrink-0 w-28 md:w-40 aspect-2/3 bg-card/50 rounded-xl" />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomeDiscovery;
