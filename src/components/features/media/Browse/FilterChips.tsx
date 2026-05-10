import { X } from 'lucide-react';
import { useGetMovieGenresQuery, useGetTVGenresQuery, useGetLanguagesQuery } from '@/api/media/mediaApi';

interface FilterChipsProps {
  query: string;
  mediaType: string;
  genreId: string;
  year: string;
  language: string;
  onRemove: (key: string, value: string) => void;
}

const FilterChips = ({
  query,
  mediaType,
  genreId,
  year,
  language,
  onRemove
}: FilterChipsProps) => {
  const { data: movieGenres } = useGetMovieGenresQuery();
  const { data: tvGenres } = useGetTVGenresQuery();
  const { data: languages } = useGetLanguagesQuery();

  const getGenreName = (id: string) => {
    const genres = mediaType === 'tv' ? tvGenres?.genres : movieGenres?.genres;
    return genres?.find(g => String(g.id) === id)?.name || id;
  };

  const getLanguageName = (code: string) => {
    return languages?.find(l => l.iso_639_1 === code)?.english_name || code;
  };

  const activeFilters = [
    { key: 'q', value: query, label: `Search: ${query}` },
    { key: 'type', value: mediaType !== 'all' ? mediaType : '', label: `Type: ${mediaType}`, icon: null },
    { key: 'genre', value: genreId, label: getGenreName(genreId) },
    { key: 'year', value: year, label: `Year: ${year}` },
    { key: 'language', value: language, label: getLanguageName(language) },
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
        onClick={() => {
          activeFilters.forEach(f => onRemove(f.key, ''));
        }}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-2 underline underline-offset-4"
      >
        Clear all
      </button>
    </div>
  );
};

export default FilterChips;
