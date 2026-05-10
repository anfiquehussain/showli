import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDiscoverQuery, useSearchMediaQuery, useGetMovieGenresQuery, useGetTVGenresQuery } from '@/api/media/mediaApi';
import BrowseToolbar from '@/components/features/media/Browse/BrowseToolbar';
import BrowseFilters from '@/components/features/media/Browse/BrowseFilters';
import BrowseResults from '@/components/features/media/Browse/BrowseResults';
import FilterChips from '@/components/features/media/Browse/FilterChips';

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

  // Data fetching
  const isSearching = !!query;

  // Search API
  const { 
    data: searchResults, 
    isLoading: isSearchLoading, 
    isFetching: isSearchFetching,
    error: searchError,
    refetch: refetchSearch
  } = useSearchMediaQuery(query, { skip: !isSearching });

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
    }
  }, { skip: isSearching });

  const results = isSearching ? searchResults : discoverResults;
  const isLoading = isSearching ? isSearchLoading : isDiscoverLoading;
  const isFetching = isSearching ? isSearchFetching : isDiscoverFetching;
  const error = isSearching ? searchError : discoverError;

  // Process and deduplicate results
  const processedResults = useMemo(() => {
    if (!results?.results) return results;
    
    const seen = new Set<string>();
    const filteredResults = results.results.filter((item: any) => {
      // In multi-search, it can be 'movie', 'tv', or 'person'
      const type = item.media_type || ('title' in item ? 'movie' : ('name' in item && !('profile_path' in item) ? 'tv' : null));
      if (!type || type === 'person') return false;
      
      const key = `${item.id}-${type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      ...results,
      results: filteredResults
    };
  }, [results]);

  const handleUpdateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // If updating filters, clear search query to avoid confusion
    if (key !== 'q' && key !== 'page') {
      newParams.delete('q');
    }

    // If updating search, reset page
    if (key === 'q' || key === 'genre' || key === 'type' || key === 'year' || key === 'language') {
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
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <BrowseFilters 
            mediaType={mediaType}
            genreId={genreId}
            year={year}
            language={language}
            onUpdateParam={handleUpdateParam}
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
                onUpdateParam={handleUpdateParam}
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
            onRemove={handleUpdateParam}
          />

          <BrowseResults 
            results={processedResults}
            isLoading={isLoading || isFetching}
            error={error}
            onRetry={isSearching ? refetchSearch : refetchDiscover}
          />
        </div>
      </div>
    </div>
  );
};

export default Browse;
