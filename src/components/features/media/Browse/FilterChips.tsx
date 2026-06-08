import { X } from 'lucide-react';
import { useGetMovieGenresQuery, useGetTVGenresQuery, useGetLanguagesQuery, useGetCountriesQuery, useGetAvailableWatchProvidersQuery, useGetWatchProviderRegionsQuery } from '@/api/media/mediaApi';
import { ALL_MODE_GENRES } from './BrowseFilters';
import type { TmdbCountry } from '@/types/tmdb.types';

interface FilterChipsProps {
  query: string;
  mediaType: string;
  genreId: string;
  year: string;
  language: string;
  country: string;
  region: string;
  provider: string;
  keywordId: string;
  keywordName: string;
  networkId: string;
  networkName: string;
  companyId: string;
  companyName: string;
  status: string;
  showType: string;
  budgetGte: string;
  budgetLte: string;
  revenueGte: string;
  revenueLte: string;
  minSeasons: string;
  maxSeasons: string;
  minEpisodes: string;
  maxEpisodes: string;
  certification: string;
  minRating: string;
  maxRating: string;
  onRemove: (key: string, value: string, extra?: { name: string; val: string }) => void;
  onClearAll: () => void;
}

const FilterChips = ({
  query,
  mediaType,
  genreId,
  year,
  language,
  country,
  region,
  provider,
  keywordId,
  keywordName,
  networkId,
  networkName,
  companyId,
  companyName,
  status,
  showType,
  budgetGte,
  budgetLte,
  revenueGte,
  revenueLte,
  minSeasons,
  maxSeasons,
  minEpisodes,
  maxEpisodes,
  certification,
  minRating,
  maxRating,
  onRemove,
  onClearAll
}: FilterChipsProps) => {
  const { data: movieGenres } = useGetMovieGenresQuery();
  const { data: tvGenres } = useGetTVGenresQuery();
  const { data: languages } = useGetLanguagesQuery();
  const { data: countries } = useGetCountriesQuery();
  const { data: watchRegions } = useGetWatchProviderRegionsQuery();
  const { data: providersData } = useGetAvailableWatchProvidersQuery({ 
    type: mediaType === 'all' ? 'movie' : mediaType as 'movie' | 'tv',
    region: country || 'US'
  });  const getGenreName = (id: string) => {
    if (mediaType === 'all') {
      const match = ALL_MODE_GENRES.find(g => g.ids.join('|') === id);
      if (match) return match.name;
    }
    const genres = mediaType === 'tv' ? tvGenres?.genres : movieGenres?.genres;
    return genres?.find(g => String(g.id) === id)?.name || id;
  };

  const getLanguageName = (code: string) => {
    return languages?.find(l => l.iso_639_1 === code)?.english_name || code;
  };

  const getCountryName = (code: string) => {
    return countries?.find(c => c.iso_3166_1 === code)?.english_name || code;
  };
  
  const getProviderName = (id: string) => {
    return providersData?.results?.find(p => String(p.provider_id) === id)?.provider_name || 'Provider';
  };

  const getRegionName = (code: string) => {
    return watchRegions?.results?.find((r: TmdbCountry) => r.iso_3166_1 === code)?.english_name || code;
  };

  const getStatusLabel = (val: string) => {
    const map: Record<string, string> = {
      '0': 'Returning Series',
      '1': 'Planned',
      '2': 'In Production',
      '3': 'Ended',
      '4': 'Canceled',
      '5': 'Pilot'
    };
    return map[val] || val;
  };

  const getShowTypeLabel = (val: string) => {
    const map: Record<string, string> = {
      '0': 'Documentary',
      '1': 'News',
      '2': 'Miniseries',
      '3': 'Reality',
      '4': 'Scripted',
      '5': 'Talk Show',
      '6': 'Video'
    };
    return map[val] || val;
  };

  const displayMinRating = minRating === '' ? '1' : minRating;
  const displayMaxRating = maxRating === '' ? '10' : maxRating;
  const ratingLabel = displayMinRating !== '1' || displayMaxRating !== '10'
    ? `Rating: ${displayMinRating}-${displayMaxRating}`
    : '';

  const activeFilters = [
    { key: 'q', value: query, label: `Search: ${query}` },
    { key: 'type', value: mediaType !== 'all' ? mediaType : '', label: `Type: ${mediaType}` },
    { key: 'genre', value: genreId, label: getGenreName(genreId) },
    { key: 'year', value: year, label: `Year: ${year}` },
    { key: 'language', value: language, label: getLanguageName(language) },
    { key: 'country', value: country, label: getCountryName(country) },
    { key: 'region', value: region && region !== 'US' ? `Region: ${getRegionName(region)}` : '', label: `Region: ${getRegionName(region)}` },
    { key: 'provider', value: provider, label: getProviderName(provider) },
    { key: 'keyword', value: keywordId, label: `Keyword: ${keywordName}`, extra: { name: 'keywordName', val: '' } },
    { key: 'network', value: networkId, label: `Network: ${networkName}`, extra: { name: 'networkName', val: '' } },
    { key: 'company', value: companyId, label: `Company: ${companyName}`, extra: { name: 'companyName', val: '' } },
    { key: 'status', value: status, label: `Status: ${getStatusLabel(status)}` },
    { key: 'showType', value: showType, label: `Show Type: ${getShowTypeLabel(showType)}` },
    { key: 'budgetGte', value: budgetGte && !budgetLte ? `Budget: >= $${budgetGte}M` : budgetGte && budgetLte ? `Budget: $${budgetGte}M-$${budgetLte}M` : '', label: budgetGte && !budgetLte ? `Budget: >= $${budgetGte}M` : `Budget: $${budgetGte}M-$${budgetLte}M` },
    { key: 'budgetLte', value: budgetLte && !budgetGte ? `Budget: <= $${budgetLte}M` : '', label: `Budget: <= $${budgetLte}M` },
    { key: 'revenueGte', value: revenueGte && !revenueLte ? `Revenue: >= $${revenueGte}M` : revenueGte && revenueLte ? `Revenue: $${revenueGte}M-$${revenueLte}M` : '', label: revenueGte && !revenueLte ? `Revenue: >= $${revenueGte}M` : `Revenue: $${revenueGte}M-$${revenueLte}M` },
    { key: 'revenueLte', value: revenueLte && !revenueGte ? `Revenue: <= $${revenueLte}M` : '', label: `Revenue: <= $${revenueLte}M` },
    { key: 'minSeasons', value: minSeasons && !maxSeasons ? `Seasons: >= ${minSeasons}` : minSeasons && maxSeasons ? `Seasons: ${minSeasons}-${maxSeasons}` : '', label: minSeasons && !maxSeasons ? `Seasons: >= ${minSeasons}` : `Seasons: ${minSeasons}-${maxSeasons}` },
    { key: 'maxSeasons', value: maxSeasons && !minSeasons ? `Seasons: <= ${maxSeasons}` : '', label: `Seasons: <= ${maxSeasons}` },
    { key: 'minEpisodes', value: minEpisodes && !maxEpisodes ? `Episodes: >= ${minEpisodes}` : minEpisodes && maxEpisodes ? `Episodes: ${minEpisodes}-${maxEpisodes}` : '', label: minEpisodes && !maxEpisodes ? `Episodes: >= ${minEpisodes}` : `Episodes: ${minEpisodes}-${maxEpisodes}` },
    { key: 'maxEpisodes', value: maxEpisodes && !minEpisodes ? `Episodes: <= ${maxEpisodes}` : '', label: `Episodes: <= ${maxEpisodes}` },
    { key: 'certification', value: certification, label: `Rated: ${certification}` },
    { key: 'rating', value: ratingLabel, label: ratingLabel },
  ].filter(f => f.value);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Active filters:</span>
      {activeFilters.map((filter) => (
        <div 
          key={`${filter.key}-${filter.value}`}
          className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium rounded-full"
        >
          <span className="capitalize">{filter.label}</span>
          <button 
            onClick={() => onRemove(filter.key, '', filter.extra)}
            className="hover:text-brand-accent transition-colors"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button 
        onClick={onClearAll}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2 underline underline-offset-4"
      >
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;
