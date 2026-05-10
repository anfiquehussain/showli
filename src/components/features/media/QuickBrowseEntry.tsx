import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Filter, ArrowRight, Film, Tv, Star } from 'lucide-react';
import { useSearchMediaQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import Button from '@/components/ui/Button';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TmdbMedia } from '@/types/tmdb.types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const QuickBrowseEntry = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch suggestions
  const { data: searchResults, isFetching } = useSearchMediaQuery(debouncedQuery, {
    skip: debouncedQuery.length < 2,
  });

  const suggestions = useMemo(() => {
    if (!searchResults?.results) return [];
    
    // Filter out non-media (people) and duplicates
    const seen = new Set<string>();
    return searchResults.results
      .filter((item: any) => {
        const type = 'title' in item ? 'movie' : ('name' in item && !('profile_path' in item) ? 'tv' : null);
        if (!type) return false;
        
        const key = `${item.id}-${type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 4);
  }, [searchResults]);

  const hasSuggestions = suggestions.length > 0 && isFocused;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsFocused(false);
    if (query.trim()) {
      navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const handleFilters = () => {
    const q = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : '';
    navigate(`/browse?focus=filters${q}`);
  };

  const handleBrowseAll = () => {
    navigate('/browse');
  };

  return (
    <section className="relative px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="bg-card/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative group">
          {/* Decorative background glow container */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none" aria-hidden="true">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/10 blur-[80px] rounded-full group-hover:bg-brand-primary/20 transition-standard" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-accent/10 blur-[80px] rounded-full group-hover:bg-brand-accent/20 transition-standard" />
          </div>

          <div className="relative z-10 flex flex-col gap-8">
            <div className="space-y-3 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">
                Find exactly what to watch
              </h2>
              <p className="text-muted-foreground max-w-xl text-balance">
                Search movies and series, then narrow by genre, language, country, rating, and more.
              </p>
            </div>

            <div className="flex flex-col gap-4" ref={containerRef}>
              <div className="relative flex-1 group/input">
                <form 
                  onSubmit={handleSearch}
                  className="relative z-20"
                >
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within/input:text-brand-primary transition-colors">
                    <Search className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search movies, TV shows, actors..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="w-full h-14 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:bg-white/10 transition-standard placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:block">
                    <Button 
                      type="submit"
                      variant="primary" 
                      size="sm"
                      className="rounded-xl px-4 py-2"
                    >
                      Search
                    </Button>
                  </div>
                </form>

                {/* Suggestions Dropdown */}
                {hasSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5">
                      <div className="px-2.5 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-white/5 mb-1 flex justify-between items-center">
                        <span>Top Suggestions</span>
                        {isFetching && <div className="w-2.5 h-2.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />}
                      </div>
                      <div className="space-y-0.5">
                        {suggestions.map((item: TmdbMedia) => {
                          const title = 'title' in item ? item.title : item.name;
                          const type = 'title' in item ? 'movie' : 'tv';
                          const year = ('release_date' in item ? item.release_date : item.first_air_date)?.split('-')[0];
                          
                          return (
                            <Link
                              key={`${item.id}-${type}`}
                              to={`/${type}/${item.id}`}
                              onClick={() => setIsFocused(false)}
                              className="flex items-center gap-2.5 p-1.5 hover:bg-white/5 rounded-xl transition-colors group/item"
                            >
                              <div className="w-8 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                                {item.poster_path ? (
                                  <img 
                                    src={getTmdbImageUrl(item.poster_path, 'w92')} 
                                    alt={title}
                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-white/5">
                                    {type === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-medium text-foreground truncate">{title}</h4>
                                  <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-muted-foreground uppercase font-bold">{type}</span>
                                </div>
                                <div className="flex items-center gap-2.5 mt-0.5 text-[10px] text-muted-foreground">
                                  <span>{year || 'N/A'}</span>
                                  <div className="flex items-center gap-1 text-warning">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    <span>{item.vote_average?.toFixed(1) || '0.0'}</span>
                                  </div>
                                </div>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                            </Link>
                          );
                        })}
                      </div>
                      
                      <div className="mt-1.5 pt-1.5 border-t border-white/5">
                        <button
                          onClick={handleSearch}
                          className="w-full p-1.5 text-[10px] font-bold text-brand-primary hover:text-brand-primary-light transition-colors flex items-center justify-center gap-1.5 group/all uppercase tracking-wider"
                        >
                          <span>View all results</span>
                          <ArrowRight className="w-3 h-3 group-hover/all:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Button
                  onClick={handleFilters}
                  variant="secondary"
                  className="rounded-2xl gap-2 h-12 px-6 bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <Filter className="w-4 h-4" />
                  <span>Advanced Filters</span>
                </Button>
                
                <Button
                  onClick={handleBrowseAll}
                  variant="ghost"
                  className="rounded-2xl gap-2 h-12 px-6 group/btn"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuickBrowseEntry;
