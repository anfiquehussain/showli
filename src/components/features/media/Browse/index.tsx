import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDiscoverQuery, useSearchMediaQuery } from '@/api/media/mediaApi';
import BrowseToolbar from '@/components/features/media/Browse/BrowseToolbar';
import BrowseFilters from '@/components/features/media/Browse/BrowseFilters';
import BrowseResults from '@/components/features/media/Browse/BrowseResults';
import FilterChips from '@/components/features/media/Browse/FilterChips';

import type { TmdbMedia } from '@/types/tmdb.types';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Sync state with URL params
  const query = searchParams.get('q') || '';
  const mediaType = (searchParams.get('type') as 'movie' | 'tv' | 'all') || 'all';
  const sortBy = searchParams.get('sort') || 'popularity.desc';
  const genreId = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const language = searchParams.get('language') || '';
  const country = searchParams.get('country') || '';
  const region = searchParams.get('region') || 'US';
  const provider = searchParams.get('provider') || '';
  const page = Number(searchParams.get('page')) || 1;

  // Handle 'focus=filters' to open sidebar automatically
  useEffect(() => {
    if (searchParams.get('focus') === 'filters') {
      setIsFilterSidebarOpen(true);
      // Clean up the param but keep other params
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('focus');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Removed smooth scroll to top to support infinite scroll experience

  // Data fetching
  const isSearching = !!query;

  // Search API
  const { 
    data: searchResults, 
    isLoading: isSearchLoading, 
    isFetching: isSearchFetching,
    error: searchError,
    refetch: refetchSearch
  } = useSearchMediaQuery({ query, page }, { skip: !isSearching });

  // Discovery API (Only one type at a time for discover)
  const discoverType = mediaType === 'all' ? 'movie' : mediaType;
  const { 
    data: discoverResults, 
    isLoading: isDiscoverLoading, 
    isFetching: isDiscoverFetching,
    error: discoverError,
    refetch: refetchDiscover
  } = useDiscoverQuery({
    type: discoverType,
    params: {
      sort_by: sortBy,
      with_genres: genreId,
      primary_release_year: year,
      first_air_date_year: year, // for TV
      with_original_language: language,
      with_origin_country: country,
      with_watch_providers: provider,
      watch_region: region,
      page,
    }
  }, { skip: isSearching });

  const results = isSearching ? searchResults : discoverResults;
  const isLoading = isSearching ? isSearchLoading : isDiscoverLoading;
  const isFetching = isSearching ? isSearchFetching : isDiscoverFetching;
  const error = isSearching ? searchError : discoverError;

  const hasMore = (results?.page || 1) < Math.min(results?.total_pages || 1, 500);

  const observer = useRef<IntersectionObserver | null>(null);
  
  const observerTarget = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // Trigger when visible, not already fetching, and there are more pages
      if (entries[0]?.isIntersecting && hasMore && !isFetching) {
        const nextPage = page + 1;
        
        // Update URL params which triggers the query with new page
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(nextPage));
        setSearchParams(newParams, { replace: true, preventScrollReset: true });
      }
    }, {
      rootMargin: '600px', // Pre-fetch when user is 600px from the bottom
    });

    if (node) observer.current.observe(node);
  }, [hasMore, isFetching, page, searchParams, setSearchParams]);

  // Process and deduplicate results
  const processedResults = useMemo(() => {
    if (!results?.results) return results;
    
    const seen = new Set<string>();
    const filteredResults = results.results.filter((item: TmdbMedia) => {
      // 1. Resolve media type
      const type = item.media_type || ('title' in item ? 'movie' : ('name' in item && !('profile_path' in item) ? 'tv' : null));
      if (!type) return false;

      // 2. Client-side filtering (especially important when isSearching is true)
      // TMDb Search API does not support advanced filters, so we apply them here.
      
      // Media Type Filter
      if (mediaType !== 'all' && type !== mediaType) return false;

      if (isSearching) {
        // Genre Filter
        if (genreId && !item.genre_ids?.includes(Number(genreId))) return false;
        
        // Year Filter
        if (year) {
          const releaseDate = 'release_date' in item ? item.release_date : ('first_air_date' in item ? item.first_air_date : null);
          const itemYear = releaseDate?.split('-')[0];
          if (itemYear !== year) return false;
        }
        
        // Language Filter
        if (language && item.original_language !== language) return false;

        // Country Filter
        if (country) {
          const originCountry = 'origin_country' in item ? item.origin_country : [];
          if (!originCountry?.includes(country)) return false;
        }

        // Provider Filter (Note: This is difficult to do client-side effectively without additional API calls per item, 
        // but for search results we might just omit it or rely on the fact that TMDb doesn't support it in multi-search anyway)
      }
      
      // 3. Deduplication
      const key = `${item.id}-${type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      ...results,
      results: filteredResults
    };
  }, [results, isSearching, mediaType, genreId, year, language, country]);

  const handleUpdateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // If updating filters, we no longer clear the search query
    // This allows hybrid filtering (search text + filters)

    // If updating search, reset page
    if (key === 'q' || key === 'genre' || key === 'type' || key === 'year' || key === 'language' || key === 'country' || key === 'provider') {
      newParams.delete('page');
    }

    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const toggleSidebar = () => setIsFilterSidebarOpen(!isFilterSidebarOpen);

  return (
    <div className="flex flex-col gap-6">
      <BrowseToolbar 
        query={query}
        mediaType={mediaType}
        sortBy={sortBy}
        onUpdateParam={handleUpdateParam}
        onToggleFilters={toggleSidebar}
      />

      <div className="flex flex-col lg:flex-row gap-8 relative">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-24 self-start max-h-[calc(100vh-8rem)] overflow-y-auto px-4 custom-scrollbar">
          <BrowseFilters 
            mediaType={mediaType}
            genreId={genreId}
            year={year}
            language={language}
            country={country}
            region={region}
            provider={provider}
            onFilterChange={handleUpdateParam}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Mobile Filters Drawer - to be implemented as a Modal or Slide-over */}
        {isFilterSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
             <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
              onClick={toggleSidebar}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-white/5 p-6 shadow-2xl animate-in slide-in-from-right duration-300">
              <BrowseFilters 
                mediaType={mediaType}
                genreId={genreId}
                year={year}
                language={language}
                country={country}
                region={region}
                provider={provider}
                onFilterChange={handleUpdateParam}
                onClear={handleClearFilters}
                onClose={toggleSidebar}
              />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-6">
          <FilterChips 
            query={query}
            mediaType={mediaType}
            genreId={genreId}
            year={year}
            language={language}
            country={country}
            region={region}
            provider={provider}
            onRemove={handleUpdateParam}
            onClearAll={handleClearFilters}
          />

          <BrowseResults 
            results={processedResults}
            isLoading={isLoading || isFetching}
            error={error}
            onRetry={isSearching ? refetchSearch : refetchDiscover}
            hasMore={hasMore}
            observerTarget={observerTarget}
          />
        </div>
      </div>
    </div>
  );
};

export default Browse;
