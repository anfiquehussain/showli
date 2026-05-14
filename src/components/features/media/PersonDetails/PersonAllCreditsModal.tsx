import { useState, useMemo } from 'react';
import { Search, X, TrendingUp, Filter } from 'lucide-react';
import Modal from '@/components/patterns/Modal';
import { MediaCard } from '@/components/patterns/MediaCard';
import type { TmdbMedia } from '@/types/tmdb.types';

interface PersonAllCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: TmdbMedia[];
  personName: string;
}

type SortOption = 'popularity' | 'newest' | 'oldest';
type TypeFilter = 'all' | 'movie' | 'tv';

const ITEMS_PER_PAGE = 24;

const PersonAllCreditsModal = ({ isOpen, onClose, credits, personName }: PersonAllCreditsModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredAndSortedCredits = useMemo(() => {
    let result = [...credits];

    // 1. Filter by Search
    if (searchQuery) {
      result = result.filter(media => {
        const title = 'title' in media ? media.title : media.name;
        return title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // 2. Filter by Type
    if (typeFilter !== 'all') {
      result = result.filter(media => media.media_type === typeFilter);
    }

    // 3. Sort
    result.sort((a, b) => {
      if (sortBy === 'popularity') {
        return (b.vote_count || 0) - (a.vote_count || 0);
      }
      
      const dateA = new Date('release_date' in a ? a.release_date : a.first_air_date || '').getTime() || 0;
      const dateB = new Date('release_date' in b ? b.release_date : b.first_air_date || '').getTime() || 0;
      
      // Always put items with no date (0) at the bottom
      if (dateA === 0 && dateB === 0) return 0;
      if (dateA === 0) return 1;
      if (dateB === 0) return -1;

      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [credits, searchQuery, typeFilter, sortBy]);

  const displayedCredits = filteredAndSortedCredits.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedCredits.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setSortBy('popularity');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`All Credits — ${personName}`}
      maxWidth="max-w-6xl"
    >
      <div className="space-y-6">
        {/* Filters Header */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="Search credits..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.08] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start">
            {(['all', 'movie', 'tv'] as TypeFilter[]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setTypeFilter(type);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  typeFilter === type 
                    ? 'bg-brand-primary text-white shadow-lg' 
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 self-start">
            <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="bg-transparent text-xs font-bold uppercase tracking-wider text-white focus:outline-none cursor-pointer"
            >
              <option value="popularity" className="bg-background text-white">Popular</option>
              <option value="newest" className="bg-background text-white">Newest</option>
              <option value="oldest" className="bg-background text-white">Oldest</option>
            </select>
          </div>
        </div>

        {/* Credits Grid */}
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {displayedCredits.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayedCredits.map((media) => (
                  <MediaCard key={`${media.id}-${media.media_type}`} item={media} />
                ))}
              </div>
              
              {hasMore && (
                <div className="flex justify-center pb-8">
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Filter className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">No matches found</p>
              <button 
                onClick={resetFilters}
                className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-primary hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>

        {/* Footer / Stats */}
        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">
          <div className="flex gap-4">
            <span>Total: {credits.length}</span>
            <span className="text-brand-primary/70">Filtered: {filteredAndSortedCredits.length}</span>
          </div>
          <span>Showing: {displayedCredits.length}</span>
        </div>
      </div>
    </Modal>
  );
};

export default PersonAllCreditsModal;
