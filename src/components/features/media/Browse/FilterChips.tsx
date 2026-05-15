import { X } from 'lucide-react';
import { useGetMovieGenresQuery, useGetTVGenresQuery, useGetLanguagesQuery, useGetCountriesQuery, useGetAvailableWatchProvidersQuery, useGetWatchProviderRegionsQuery } from '@/api/media/mediaApi';
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
  onRemove: (key: string, value: string) => void;
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
  });

  const getGenreName = (id: string) => {
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

  const activeFilters = [
    { key: 'q', value: query, label: `Search: ${query}` },
    { key: 'type', value: mediaType !== 'all' ? mediaType : '', label: `Type: ${mediaType}` },
    { key: 'genre', value: genreId, label: getGenreName(genreId) },
    { key: 'year', value: year, label: `Year: ${year}` },
    { key: 'language', value: language, label: getLanguageName(language) },
    { key: 'country', value: country, label: getCountryName(country) },
    { key: 'region', value: region && region !== 'US' ? `Region: ${getRegionName(region)}` : '', label: `Region: ${getRegionName(region)}` },
    { key: 'provider', value: provider, label: getProviderName(provider) },
  ].filter(f => f.value);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Active filters:</span>
      {activeFilters.map((filter) => (
        <div 
          key={filter.key}
          className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-medium rounded-full"
        >
          <span className="capitalize">{filter.label}</span>
          <button 
            onClick={() => onRemove(filter.key, '')}
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
