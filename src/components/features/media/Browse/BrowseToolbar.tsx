import { Search, Filter, ChevronDown } from 'lucide-react';
import SearchBar from '@/components/patterns/SearchBar';
import Button from '@/components/ui/Button';

interface BrowseToolbarProps {
  query: string;
  mediaType: string;
  sortBy: string;
  onUpdateParam: (key: string, value: string) => void;
  onToggleFilters: () => void;
}

const BrowseToolbar = ({
  query,
  mediaType,
  sortBy,
  onUpdateParam,
  onToggleFilters
}: BrowseToolbarProps) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4 bg-card/30 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl">
      <div className="w-full md:w-1/3 lg:w-1/2">
        <SearchBar 
          value={query}
          onChange={(val) => onUpdateParam('q', val)}
          placeholder="Search movies or TV shows…"
          containerClassName="max-w-none"
          className="h-12 bg-white/5 border-white/10"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        {/* Media Type Selector */}
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {['all', 'movie', 'tv'].map((type) => (
            <button
              key={type}
              onClick={() => onUpdateParam('type', type)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-standard capitalize
                ${mediaType === type 
                  ? 'bg-brand-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:text-foreground'}
              `}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Selector - Desktop only in this row, or simplified */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/10 text-sm">
          <span className="text-muted-foreground">Sort:</span>
          <select 
            value={sortBy}
            onChange={(e) => onUpdateParam('sort', e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-foreground cursor-pointer appearance-none pr-6 relative"
            style={{ backgroundImage: 'none' }}
          >
            <option value="popularity.desc">Popularity</option>
            <option value="vote_average.desc">Rating</option>
            <option value="primary_release_date.desc">Release Date</option>
            <option value="revenue.desc">Revenue</option>
          </select>
          <ChevronDown className="w-4 h-4 text-muted-foreground -ml-5 pointer-events-none" />
        </div>

        {/* Filter Toggle (Mobile/Tablet) */}
        <Button
          variant="secondary"
          className="lg:hidden h-12 w-12 p-0 flex items-center justify-center rounded-xl"
          onClick={onToggleFilters}
          aria-label="Toggle Filters"
        >
          <Filter className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default BrowseToolbar;
