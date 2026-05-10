import MediaCard from '@/components/patterns/MediaCard';
import type { TmdbPaginatedResponse, TmdbMedia } from '@/types/tmdb.types';
import { AlertCircle, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface BrowseResultsProps {
  results?: TmdbPaginatedResponse<TmdbMedia>;
  isLoading: boolean;
  error: any;
  onRetry: () => void;
}

const BrowseResults = ({
  results,
  isLoading,
  error,
  onRetry
}: BrowseResultsProps) => {
  if (isLoading && !results) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-[2/3] bg-white/5 rounded-xl border border-white/5" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Something went wrong</h3>
          <p className="text-muted-foreground">We couldn't load the results. Please try again.</p>
        </div>
        <Button onClick={onRetry} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  const items = results?.results || [];

  if (items.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-white/5 text-muted-foreground rounded-full flex items-center justify-center">
          <SearchX className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {items.length} of {results?.total_results?.toLocaleString() || 0} results</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {items.map((item) => (
          <MediaCard 
            key={`${item.media_type}-${item.id}`} 
            item={item} 
          />
        ))}

        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={`loading-${i}`} className="space-y-3 animate-pulse">
            <div className="aspect-[2/3] bg-white/5 rounded-xl border border-white/5" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};

// SearchX icon helper since lucide-react might not have it in the expected name or I want a specific look
import { Search } from 'lucide-react';
const SearchX = ({ className }: { className?: string }) => (
  <div className="relative">
    <Search className={className} />
    <div className="absolute top-0 right-0 -mr-1 -mt-1 w-4 h-4 bg-error rounded-full flex items-center justify-center border-2 border-card">
      <div className="w-2 h-0.5 bg-white rotate-45 absolute" />
      <div className="w-2 h-0.5 bg-white -rotate-45 absolute" />
    </div>
  </div>
);

export default BrowseResults;
