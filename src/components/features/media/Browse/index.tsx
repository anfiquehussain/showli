import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDiscoverQuery, useSearchMediaQuery, mediaApi } from '@/api/media/mediaApi';
import BrowseToolbar from '@/components/features/media/Browse/BrowseToolbar';
import BrowseFilters from '@/components/features/media/Browse/BrowseFilters';
import BrowseResults from '@/components/features/media/Browse/BrowseResults';
import FilterChips from '@/components/features/media/Browse/FilterChips';
import { useAppDispatch } from '@/hooks/useRedux';

import type { TmdbMedia, TmdbTVDetails, TmdbMovieDetails } from '@/types/tmdb.types';

const Browse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state directly from URL parameter to avoid effect-driven cascading renders
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(() => searchParams.get('focus') === 'filters');

  // Lock body scroll when mobile filter sidebar is open
  useEffect(() => {
    if (isFilterSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFilterSidebarOpen]);

  // Sync state with URL params
  const query = searchParams.get('q') || '';
  const [searchVal, setSearchVal] = useState(query);
  
  // Track previous query to adjust state during render (React recommended pattern)
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSearchVal(query);
  }

  // Debounce search query parameter updates to prevent input lag & autofill merge bugs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchVal !== query) {
        const newParams = new URLSearchParams(searchParams);
        if (searchVal) {
          newParams.set('q', searchVal);
        } else {
          newParams.delete('q');
        }
        newParams.delete('page');
        setSearchParams(newParams);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchVal, query, searchParams, setSearchParams]);
  const mediaType = (searchParams.get('type') as 'movie' | 'tv' | 'all') || 'all';
  const sortBy = searchParams.get('sort') || 'popularity.desc';
  const genreId = searchParams.get('genre') || '';
  const year = searchParams.get('year') || '';
  const language = searchParams.get('language') || '';
  const country = searchParams.get('country') || '';
  const region = searchParams.get('region') || 'US';
  const provider = searchParams.get('provider') || '';
  const keywordId = searchParams.get('keyword') || '';
  const keywordName = searchParams.get('keywordName') || '';
  const company = searchParams.get('company') || '';
  const companyName = searchParams.get('companyName') || '';
  const network = searchParams.get('network') || '';
  const networkName = searchParams.get('networkName') || '';
  const status = searchParams.get('status') || '';
  const showType = searchParams.get('showType') || '';
  const budgetGte = searchParams.get('budgetGte') || '';
  const budgetLte = searchParams.get('budgetLte') || '';
  const revenueGte = searchParams.get('revenueGte') || '';
  const revenueLte = searchParams.get('revenueLte') || '';
  const minSeasons = searchParams.get('minSeasons') || '';
  const maxSeasons = searchParams.get('maxSeasons') || '';
  const minEpisodes = searchParams.get('minEpisodes') || '';
  const maxEpisodes = searchParams.get('maxEpisodes') || '';
  const certification = searchParams.get('certification') || '';
  const page = Number(searchParams.get('page')) || 1;

  const dispatch = useAppDispatch();
  const [tvDetailsCache, setTvDetailsCache] = useState<Record<number, TmdbTVDetails>>({});
  const [movieDetailsCache, setMovieDetailsCache] = useState<Record<number, TmdbMovieDetails>>({});

  // Handle URL 'focus=filters' parameter cleanup (no setState called inside)
  useEffect(() => {
    if (searchParams.get('focus') === 'filters') {
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
      with_keywords: keywordId,
      with_networks: network,
      with_companies: company,
      with_status: discoverType === 'tv' && status ? status : undefined,
      with_type: discoverType === 'tv' && showType ? showType : undefined,
      'budget.gte': discoverType === 'movie' && budgetGte ? Number(budgetGte) * 1000000 : undefined,
      'budget.lte': discoverType === 'movie' && budgetLte ? Number(budgetLte) * 1000000 : undefined,
      'revenue.gte': discoverType === 'movie' && revenueGte ? Number(revenueGte) * 1000000 : undefined,
      'revenue.lte': discoverType === 'movie' && revenueLte ? Number(revenueLte) * 1000000 : undefined,
      certification_country: discoverType === 'movie' && certification ? 'US' : undefined,
      certification: discoverType === 'movie' && certification ? certification : undefined,
      page,
    } as Record<string, string | number>
  }, { skip: isSearching });

  const results = isSearching ? searchResults : discoverResults;
  const isLoading = isSearching ? isSearchLoading : isDiscoverLoading;
  const isFetching = isSearching ? isSearchFetching : isDiscoverFetching;
  const error = isSearching ? searchError : discoverError;

  // Background fetch TV details if TV-specific client-side filters (seasons, episodes, status, showType in search mode) are active
  useEffect(() => {
    if (!results?.results) return;
    const isTvFilterActive = !!(minSeasons || maxSeasons || minEpisodes || maxEpisodes || (isSearching && (status || showType)));
    if (!isTvFilterActive) return;

    const tvShowsToFetch = results.results.filter(
      (item: TmdbMedia) =>
        ('name' in item && !('profile_path' in item)) &&
        !tvDetailsCache[item.id]
    );

    if (tvShowsToFetch.length === 0) return;

    tvShowsToFetch.forEach((show) => {
      dispatch(mediaApi.endpoints.getTVDetails.initiate(show.id))
        .unwrap()
        .then((details) => {
          setTvDetailsCache((prev) => ({ ...prev, [show.id]: details }));
        })
        .catch((err) => console.error(err));
    });
  }, [results, tvDetailsCache, minSeasons, maxSeasons, minEpisodes, maxEpisodes, status, showType, isSearching, dispatch]);

  // Background fetch Movie details if movie-specific client-side filters are active during search (where TMDB doesn't support them)
  useEffect(() => {
    if (!results?.results) return;
    const isMovieFilterActive = !!(budgetGte || budgetLte || revenueGte || revenueLte);
    if (!isSearching || !isMovieFilterActive) return;

    const moviesToFetch = results.results.filter(
      (item: TmdbMedia) =>
        ('title' in item) &&
        !movieDetailsCache[item.id]
    );

    if (moviesToFetch.length === 0) return;

    moviesToFetch.forEach((movie) => {
      dispatch(mediaApi.endpoints.getMovieDetails.initiate(movie.id))
        .unwrap()
        .then((details) => {
          setMovieDetailsCache((prev) => ({ ...prev, [movie.id]: details }));
        })
        .catch((err) => console.error(err));
    });
  }, [results, movieDetailsCache, isSearching, budgetGte, budgetLte, revenueGte, revenueLte, dispatch]);

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

        // Status Filter in Search Mode
        if (type === 'tv' && status) {
          const details = tvDetailsCache[item.id];
          if (!details) return false; // hide until details load
          const statusTextMap: Record<string, string> = {
            'Returning Series': '0',
            'Planned': '1',
            'In Production': '2',
            'Ended': '3',
            'Canceled': '4',
            'Pilot': '5'
          };
          if (statusTextMap[details.status] !== status) return false;
        }

        // Show Type Filter in Search Mode
        if (type === 'tv' && showType) {
          const details = tvDetailsCache[item.id];
          if (!details) return false;
          const typeTextMap: Record<string, string> = {
            'Documentary': '0',
            'News': '1',
            'Miniseries': '2',
            'Reality': '3',
            'Scripted': '4',
            'Talk Show': '5',
            'Video': '6'
          };
          if (typeTextMap[details.type] !== showType) return false;
        }

        // Budget Filter in Search Mode
        if (type === 'movie' && (budgetGte || budgetLte)) {
          const details = movieDetailsCache[item.id];
          if (!details) return false;
          const budgetMillions = details.budget / 1000000;
          if (budgetGte && budgetMillions < Number(budgetGte)) return false;
          if (budgetLte && budgetMillions > Number(budgetLte)) return false;
        }

        // Revenue Filter in Search Mode
        if (type === 'movie' && (revenueGte || revenueLte)) {
          const details = movieDetailsCache[item.id];
          if (!details) return false;
          const revenueMillions = details.revenue / 1000000;
          if (revenueGte && revenueMillions < Number(revenueGte)) return false;
          if (revenueLte && revenueMillions > Number(revenueLte)) return false;
        }
      }

      // TV Seasons & Episodes Filter (Always Client-Side since TMDB Discover doesn't support them)
      if (type === 'tv' && (minSeasons || maxSeasons)) {
        const details = tvDetailsCache[item.id];
        if (!details) return false;
        const seasons = details.number_of_seasons;
        if (minSeasons && seasons < Number(minSeasons)) return false;
        if (maxSeasons && seasons > Number(maxSeasons)) return false;
      }
      if (type === 'tv' && (minEpisodes || maxEpisodes)) {
        const details = tvDetailsCache[item.id];
        if (!details) return false;
        const episodes = details.number_of_episodes;
        if (minEpisodes && episodes < Number(minEpisodes)) return false;
        if (maxEpisodes && episodes > Number(maxEpisodes)) return false;
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
  }, [results, isSearching, mediaType, genreId, year, language, country, status, showType, budgetGte, budgetLte, revenueGte, revenueLte, minSeasons, maxSeasons, minEpisodes, maxEpisodes, tvDetailsCache, movieDetailsCache]);

  const handleUpdateParam = (key: string, value: string, extra?: { name: string; val: string }) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
      if (extra) {
        newParams.set(extra.name, extra.val);
      }
    } else {
      newParams.delete(key);
      if (extra) {
        newParams.delete(extra.name);
      }
    }
    
    // If updating filters, we no longer clear the search query
    // This allows hybrid filtering (search text + filters)

    // If updating search, reset page
    if (
      key === 'q' || 
      key === 'genre' || 
      key === 'type' || 
      key === 'year' || 
      key === 'language' || 
      key === 'country' || 
      key === 'provider' ||
      key === 'keyword' ||
      key === 'network' ||
      key === 'company' ||
      key === 'status' ||
      key === 'showType' ||
      key === 'budgetGte' ||
      key === 'budgetLte' ||
      key === 'revenueGte' ||
      key === 'revenueLte' ||
      key === 'minSeasons' ||
      key === 'maxSeasons' ||
      key === 'minEpisodes' ||
      key === 'maxEpisodes' ||
      key === 'certification'
    ) {
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
        query={searchVal}
        mediaType={mediaType}
        sortBy={sortBy}
        onUpdateParam={(key: string, val: string) => {
          if (key === 'q') {
            setSearchVal(val);
          } else {
            handleUpdateParam(key, val);
          }
        }}
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
            keywordId={keywordId}
            keywordName={keywordName}
            companyId={company}
            companyName={companyName}
            status={status}
            showType={showType}
            budgetGte={budgetGte}
            budgetLte={budgetLte}
            revenueGte={revenueGte}
            revenueLte={revenueLte}
            minSeasons={minSeasons}
            maxSeasons={maxSeasons}
            minEpisodes={minEpisodes}
            maxEpisodes={maxEpisodes}
            networkId={network}
            networkName={networkName}
            certification={certification}
            onFilterChange={handleUpdateParam}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Mobile Filters Drawer - to be implemented as a Slide-over */}
        {isFilterSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 overflow-hidden">
             <div 
              className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
              onClick={toggleSidebar}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-card border-l border-white/5 p-6 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
              <BrowseFilters 
                mediaType={mediaType}
                genreId={genreId}
                year={year}
                language={language}
                country={country}
                region={region}
                provider={provider}
                keywordId={keywordId}
                keywordName={keywordName}
                companyId={company}
                companyName={companyName}
                status={status}
                showType={showType}
                budgetGte={budgetGte}
                budgetLte={budgetLte}
                revenueGte={revenueGte}
                revenueLte={revenueLte}
                minSeasons={minSeasons}
                maxSeasons={maxSeasons}
                minEpisodes={minEpisodes}
                maxEpisodes={maxEpisodes}
                networkId={network}
                networkName={networkName}
                certification={certification}
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
            keywordId={keywordId}
            keywordName={keywordName}
            networkId={network}
            networkName={networkName}
            companyId={company}
            companyName={companyName}
            status={status}
            showType={showType}
            budgetGte={budgetGte}
            budgetLte={budgetLte}
            revenueGte={revenueGte}
            revenueLte={revenueLte}
            minSeasons={minSeasons}
            maxSeasons={maxSeasons}
            minEpisodes={minEpisodes}
            maxEpisodes={maxEpisodes}
            certification={certification}
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
