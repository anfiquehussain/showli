import { X, RotateCcw } from 'lucide-react';
import { 
  useGetMovieGenresQuery, 
  useGetTVGenresQuery, 
  useGetLanguagesQuery, 
  useGetCountriesQuery 
} from '@/api/media/mediaApi';
import Button from '@/components/ui/Button';

interface BrowseFiltersProps {
  mediaType: string;
  genreId: string;
  year: string;
  language: string;
  onUpdateParam: (key: string, value: string) => void;
  onClear: () => void;
  onClose?: () => void;
}

const BrowseFilters = ({
  mediaType,
  genreId,
  year,
  language,
  onUpdateParam,
  onClear,
  onClose
}: BrowseFiltersProps) => {
  // Fetch filter data
  const { data: movieGenres } = useGetMovieGenresQuery(undefined, { skip: mediaType === 'tv' });
  const { data: tvGenres } = useGetTVGenresQuery(undefined, { skip: mediaType === 'movie' });
  const { data: languages } = useGetLanguagesQuery();
  const { data: countries } = useGetCountriesQuery();

  const genres = mediaType === 'tv' ? tvGenres?.genres : movieGenres?.genres;

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Filters
        </h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {/* Genres */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genres?.map((genre) => (
              <button
                key={genre.id}
                onClick={() => onUpdateParam('genre', genreId === String(genre.id) ? '' : String(genre.id))}
                className={`
                  px-3 py-1.5 text-sm rounded-lg border transition-standard
                  ${genreId === String(genre.id)
                    ? 'bg-brand-primary/20 border-brand-primary text-brand-primary'
                    : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/10 hover:text-foreground'}
                `}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Release Year */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Release Year
          </label>
          <select
            value={year}
            onChange={(e) => onUpdateParam('year', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none appearance-none"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => onUpdateParam('language', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none appearance-none"
          >
            <option value="">All Languages</option>
            {languages?.map((lang) => (
              <option key={lang.iso_639_1} value={lang.iso_639_1}>
                {lang.english_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-white/5 mt-auto">
        <Button
          variant="secondary"
          className="w-full gap-2 h-11"
          onClick={onClear}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Filters</span>
        </Button>
      </div>
    </div>
  );
};

export default BrowseFilters;
