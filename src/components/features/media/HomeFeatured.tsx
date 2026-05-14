import { 
  useGetTrendingQuery, 
  useGetPopularMoviesQuery, 
  useGetTopRatedMoviesQuery, 
  useGetUpcomingMoviesQuery,
  useGetTopRatedTVQuery,
  useGetPopularPeopleQuery,
  useSearchMediaQuery
} from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import PersonScroll from '@/components/patterns/PersonScroll';
import QuickBrowseHub from './QuickBrowseHub';
import { 
  TrendingUp, 
  Flame, 
  Film, 
  Star, 
  Calendar, 
  Tv, 
  Users,
  Search,
  ArrowRight
} from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTmdbImageUrl } from '@/utils/image';
import type { TmdbMedia } from '@/types/tmdb.types';

const HomeFeatured = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch suggestions
  const { data: searchResults, isFetching } = useSearchMediaQuery({ query: debouncedQuery }, {
    skip: debouncedQuery.length < 2,
  });

  const suggestions = useMemo(() => {
    if (!searchResults?.results) return [];
    
    // Filter out items without poster/profile and limit to 5
    const seen = new Set<string>();
    return searchResults.results
      .filter((item: TmdbMedia) => {
        const type = 'title' in item ? 'movie' : ('name' in item && !('profile_path' in item) ? 'tv' : null);
        if (!type) return false;
        
        const key = `${item.id}-${type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 5);
  }, [searchResults]);

  const hasSuggestions = suggestions.length > 0 && isFocused;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: trendingDay, isLoading: loadingDay } = useGetTrendingQuery({ type: 'all', timeWindow: 'day' });
  const { data: trendingWeek, isLoading: loadingWeek } = useGetTrendingQuery({ type: 'all', timeWindow: 'week' });
  const { data: popularMovies, isLoading: loadingPopMovies } = useGetPopularMoviesQuery();
  const { data: topRatedMovies, isLoading: loadingTopMovies } = useGetTopRatedMoviesQuery();
  const { data: upcomingMovies, isLoading: loadingUpcoming } = useGetUpcomingMoviesQuery();
  const { data: topRatedTV, isLoading: loadingTopTV } = useGetTopRatedTVQuery();
  const { data: popularPeople, isLoading: loadingPeople } = useGetPopularPeopleQuery({ page: 1 });

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setIsFocused(false);
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Mini Search Bar with Suggestions */}
      <div className="max-w-2xl mx-auto px-4" ref={containerRef}>
        <div className="relative group">
          <form onSubmit={handleSearch} className="relative z-20">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text"
              placeholder="Search movies, TV shows, actors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="w-full h-12 pl-12 pr-4 bg-card/40 backdrop-blur-xl border border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-standard"
            />
          </form>

          {/* Suggestions Dropdown */}
          {hasSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 mb-1 flex justify-between items-center">
                  <span>Quick Results</span>
                  {isFetching && <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />}
                </div>
                
                <div className="space-y-1">
                  {suggestions.map((item: TmdbMedia) => {
                    const title = 'title' in item ? item.title : item.name;
                    const type = 'title' in item ? 'movie' : 'tv';
                    const year = ('release_date' in item ? item.release_date : item.first_air_date)?.split('-')[0];
                    
                    return (
                      <Link
                        key={`${item.id}-${type}`}
                        to={`/${type}/${item.id}`}
                        onClick={() => setIsFocused(false)}
                        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors group/item"
                      >
                        <div className="w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                          {item.poster_path ? (
                            <img 
                              src={getTmdbImageUrl(item.poster_path, 'w92')} 
                              alt={title}
                              className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              {type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground uppercase font-bold">{type}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{year || 'N/A'}</span>
                            <div className="flex items-center gap-1 text-warning">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{item.vote_average?.toFixed(1) || '0.0'}</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                      </Link>
                    );
                  })}
                </div>
                
                <div className="mt-2 pt-2 border-t border-white/5">
                  <button
                    onClick={handleSearch}
                    className="w-full p-2 text-xs font-bold text-brand-primary hover:text-brand-primary-light transition-colors flex items-center justify-center gap-2 group/all uppercase tracking-wider"
                  >
                    <span>View all results for "{searchQuery}"</span>
                    <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <MediaScroll 
        title="Trending Today" 
        icon={<TrendingUp className="w-4 h-4" />} 
        items={trendingDay?.results || []} 
        isLoading={loadingDay}
        onViewAll={() => navigate('/browse?sort_by=trending.day')}
      />

      <MediaScroll 
        title="Top of the Week" 
        icon={<Flame className="w-4 h-4" />} 
        items={trendingWeek?.results || []} 
        isLoading={loadingWeek}
        onViewAll={() => navigate('/browse?sort_by=trending.week')}
      />

      <QuickBrowseHub />

      <PersonScroll 
        title="Popular People" 
        icon={<Users className="w-4 h-4" />} 
        items={popularPeople?.results || []} 
        isLoading={loadingPeople}
      />

      <MediaScroll 
        title="Popular Movies" 
        icon={<Film className="w-4 h-4" />} 
        items={popularMovies?.results || []} 
        isLoading={loadingPopMovies}
        onViewAll={() => navigate('/browse?type=movie&sort_by=popularity.desc')}
      />

      <MediaScroll 
        title="All-Time Best" 
        icon={<Star className="w-4 h-4" />} 
        items={topRatedMovies?.results || []} 
        isLoading={loadingTopMovies}
        onViewAll={() => navigate('/browse?type=movie&sort_by=vote_average.desc')}
      />

      <MediaScroll 
        title="Upcoming Releases" 
        icon={<Calendar className="w-4 h-4" />} 
        items={upcomingMovies?.results || []} 
        isLoading={loadingUpcoming}
        onViewAll={() => navigate('/browse?type=movie&status=upcoming')}
      />

      <MediaScroll 
        title="Top Rated Series" 
        icon={<Tv className="w-4 h-4" />} 
        items={topRatedTV?.results || []} 
        isLoading={loadingTopTV}
        onViewAll={() => navigate('/browse?type=tv&sort_by=vote_average.desc')}
      />
    </div>
  );
};

export default HomeFeatured;
