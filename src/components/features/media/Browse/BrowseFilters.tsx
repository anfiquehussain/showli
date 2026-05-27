import React from 'react';
import { X, RotateCcw, Search, Tag, Building2 } from 'lucide-react';
import {
  useGetMovieGenresQuery,
  useGetTVGenresQuery,
  useGetLanguagesQuery,
  useGetCountriesQuery,
  useGetAvailableWatchProvidersQuery,
  useGetWatchProviderRegionsQuery,
  useSearchKeywordsQuery,
  useSearchCompaniesQuery
} from '@/api/media/mediaApi';
import Button from '@/components/ui/Button';

interface BrowseFiltersProps {
  mediaType: string;
  genreId: string;
  year: string;
  language: string;
  country: string;
  region: string;
  provider: string;
  keywordId: string;
  keywordName: string;
  companyId: string;
  companyName: string;
  onFilterChange: (key: string, value: string, extra?: { name: string; val: string }) => void;
  onClear: () => void;
  onClose?: () => void;
}

const popularKeywords = [
  { id: 9715, name: 'superhero' },
  { id: 9663, name: 'time travel' },
  { id: 10349, name: 'zombie' },
  { id: 818, name: 'based on novel' }
];

const popularCompanies = [
  { id: 420, name: 'Marvel Studios' },
  { id: 3, name: 'Pixar' },
  { id: 41077, name: 'A24' },
  { id: 10342, name: 'Studio Ghibli' }
];

const BrowseFilters = ({
  mediaType,
  genreId,
  year,
  language,
  country,
  region,
  provider,
  keywordName,
  companyId,
  companyName,
  onFilterChange,
  onClear,
  onClose
}: BrowseFiltersProps) => {
  // Fetch filter data
  const { data: movieGenres } = useGetMovieGenresQuery(undefined, { skip: mediaType === 'tv' });
  const { data: tvGenres } = useGetTVGenresQuery(undefined, { skip: mediaType === 'movie' });
  const { data: languages } = useGetLanguagesQuery();
  const { data: countries } = useGetCountriesQuery();
  const { data: watchRegions } = useGetWatchProviderRegionsQuery();
  const { data: providersData } = useGetAvailableWatchProvidersQuery({
    type: mediaType === 'all' ? 'movie' : mediaType as 'movie' | 'tv',
    region: region || 'US'
  });

  const [showAllProviders, setShowAllProviders] = React.useState(false);
  const [providerSearch, setProviderSearch] = React.useState('');
  const [keywordInput, setKeywordInput] = React.useState('');
  const [companyInput, setCompanyInput] = React.useState('');

  const { data: keywordSuggestions, isLoading: isKeywordSearching } = useSearchKeywordsQuery(
    { query: keywordInput },
    { skip: keywordInput.length < 2 }
  );

  const { data: companySuggestions, isLoading: isCompanySearching } = useSearchCompaniesQuery(
    { query: companyInput },
    { skip: companyInput.length < 2 }
  );

  const genres = mediaType === 'tv' ? tvGenres?.genres : movieGenres?.genres;
  const allProviders = providersData?.results || [];
  const filteredProviders = allProviders.filter(p =>
    p.provider_name.toLowerCase().includes(providerSearch.toLowerCase())
  );
  const providers = (showAllProviders || providerSearch) ? filteredProviders : filteredProviders.slice(0, 16);

  const currentYear = new Date().getFullYear();

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

      <div className="space-y-6 flex-1 pr-2 overflow-y-auto custom-scrollbar">
        {/* Genres */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genres?.map((genre) => (
              <button
                key={genre.id}
                onClick={() => onFilterChange('genre', genreId === String(genre.id) ? '' : String(genre.id))}
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

        {/* Keywords */}
        <div className="space-y-3 relative">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Keywords
          </label>
          {keywordName ? (
            <div className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/30 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2 text-brand-primary">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-semibold truncate max-w-[180px]">{keywordName}</span>
              </div>
              <button
                type="button"
                onClick={() => onFilterChange('keyword', '', { name: 'keywordName', val: '' })}
                className="text-brand-primary hover:text-brand-accent transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search keywords…"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none transition-standard placeholder:text-muted-foreground/30"
                />
                {keywordInput.length >= 2 && keywordSuggestions?.results && (
                  <div className="absolute z-50 w-full bg-card border border-white/10 rounded-xl shadow-2xl mt-1 max-h-48 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                    {isKeywordSearching && (
                      <div className="text-xs text-muted-foreground italic px-3 py-2">Searching…</div>
                    )}
                    {!isKeywordSearching && keywordSuggestions.results.length === 0 && (
                      <div className="text-xs text-muted-foreground italic px-3 py-2">No keywords found</div>
                    )}
                    {keywordSuggestions.results.map((kw) => (
                      <button
                        key={kw.id}
                        type="button"
                        onClick={() => {
                          onFilterChange('keyword', String(kw.id), { name: 'keywordName', val: kw.name });
                          setKeywordInput('');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold text-white/70 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors cursor-pointer"
                      >
                        {kw.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {popularKeywords.map((kw) => (
                  <button
                    key={kw.id}
                    type="button"
                    onClick={() => onFilterChange('keyword', String(kw.id), { name: 'keywordName', val: kw.name })}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white/5 hover:bg-brand-primary/10 hover:text-brand-primary border border-white/5 hover:border-brand-primary/30 rounded-lg transition-standard text-muted-foreground cursor-pointer"
                  >
                    {kw.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Production Companies */}
        <div className="space-y-3 relative">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Production Companies
          </label>
          {companyName ? (
            <div key={companyId} className="flex items-center justify-between bg-brand-primary/10 border border-brand-primary/30 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-2 text-brand-primary">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-semibold truncate max-w-[180px]">{companyName}</span>
              </div>
              <button
                type="button"
                onClick={() => onFilterChange('company', '', { name: 'companyName', val: '' })}
                className="text-brand-primary hover:text-brand-accent transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search companies…"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none transition-standard placeholder:text-muted-foreground/30"
                />
                {companyInput.length >= 2 && companySuggestions?.results && (
                  <div className="absolute z-50 w-full bg-card border border-white/10 rounded-xl shadow-2xl mt-1 max-h-48 overflow-y-auto custom-scrollbar p-1.5 space-y-1">
                    {isCompanySearching && (
                      <div className="text-xs text-muted-foreground italic px-3 py-2">Searching…</div>
                    )}
                    {!isCompanySearching && companySuggestions.results.length === 0 && (
                      <div className="text-xs text-muted-foreground italic px-3 py-2">No companies found</div>
                    )}
                    {companySuggestions.results.map((comp) => (
                      <button
                        key={comp.id}
                        type="button"
                        onClick={() => {
                          onFilterChange('company', String(comp.id), { name: 'companyName', val: comp.name });
                          setCompanyInput('');
                        }}
                        className="w-full flex items-center gap-3 text-left px-3 py-2 text-xs font-semibold text-white/70 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors cursor-pointer"
                      >
                        {comp.logo_path ? (
                          <div className="w-6 h-6 rounded bg-white flex items-center justify-center shrink-0 overflow-hidden">
                            <img
                              src={`https://image.tmdb.org/t/p/w92${comp.logo_path}`}
                              alt={comp.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0 text-white/60">
                            <Building2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="truncate">{comp.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {popularCompanies.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => onFilterChange('company', String(comp.id), { name: 'companyName', val: comp.name })}
                    className="px-2.5 py-1 text-[11px] font-medium bg-white/5 hover:bg-brand-primary/10 hover:text-brand-primary border border-white/5 hover:border-brand-primary/30 rounded-lg transition-standard text-muted-foreground cursor-pointer"
                  >
                    {comp.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Release Year */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Release Year
          </label>
          <div className="relative group">
            <input
              type="number"
              min="1900"
              max={currentYear + 5}
              value={year}
              onChange={(e) => onFilterChange('year', e.target.value)}
              placeholder="e.g. 2024"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none transition-standard placeholder:text-muted-foreground/30"
            />
            {year && (
              <button
                onClick={() => onFilterChange('year', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Language */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => {
              const val = e.target.value;
              const text = languages?.find(l => l.iso_639_1 === val)?.english_name || '';
              onFilterChange('language', val, val ? { name: 'languageName', val: text } : undefined);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none appearance-none"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-card text-foreground">All Languages</option>
            {languages?.map((lang) => (
              <option key={lang.iso_639_1} value={lang.iso_639_1} className="bg-card text-foreground">
                {lang.english_name}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => {
              const val = e.target.value;
              const text = countries?.find(c => c.iso_3166_1 === val)?.english_name || '';
              onFilterChange('country', val, val ? { name: 'countryName', val: text } : undefined);
            }}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-primary/50 focus:outline-none appearance-none"
            style={{ colorScheme: 'dark' }}
          >
            <option value="" className="bg-card text-foreground">All Countries</option>
            {countries?.map((c) => (
              <option key={c.iso_3166_1} value={c.iso_3166_1} className="bg-card text-foreground">
                {c.english_name}
              </option>
            ))}
          </select>
        </div>

        {/* Streaming Region */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Streaming Region
          </label>
          <select
            value={region}
            onChange={(e) => onFilterChange('region', e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-2 text-sm text-white focus:border-brand-primary/50 focus:outline-none"
          >
            {watchRegions?.results.map((r) => (
              <option key={r.iso_3166_1} value={r.iso_3166_1} className="bg-card">
                {r.english_name}
              </option>
            ))}
          </select>
        </div>

        {/* Watch Providers */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Watch Providers
            </label>
            {allProviders.length > 8 && (
              <div className="relative group/search">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within/search:text-brand-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search…"
                  value={providerSearch}
                  onChange={(e) => setProviderSearch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-2 py-1 text-xs w-32 focus:w-40 focus:ring-1 focus:ring-brand-primary/50 focus:outline-none transition-all placeholder:text-muted-foreground/30"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2 pt-8">
            {providers?.map((p) => (
              <button
                key={p.provider_id}
                onClick={() => onFilterChange('provider', provider === String(p.provider_id) ? '' : String(p.provider_id))}
                className={`
                  aspect-square rounded-lg border transition-standard relative group
                  ${provider === String(p.provider_id)
                    ? 'border-brand-primary ring-2 ring-brand-primary/50'
                    : 'border-white/5 hover:border-white/20'}
                `}
                title={p.provider_name}
              >
                <img
                  src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                  alt={p.provider_name}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className={`absolute inset-0 bg-brand-primary/20 transition-opacity ${provider === String(p.provider_id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                {/* Floating Tooltip on Hover */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-card border border-white/10 rounded text-[10px] text-white opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-xl group-hover:-top-12 duration-200 min-w-[60px] max-w-[100px] text-center leading-tight wrap-break-word">
                  {p.provider_name}
                  {/* Arrow */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-card border-r border-b border-white/10 rotate-45" />
                </div>
              </button>
            ))}
          </div>
          {allProviders.length > 16 && !providerSearch && (
            <button
              onClick={() => setShowAllProviders(!showAllProviders)}
              className="text-xs text-brand-primary hover:text-brand-accent transition-colors font-medium mt-2"
            >
              {showAllProviders ? 'Show Less' : `Show All (${allProviders.length})`}
            </button>
          )}
          {providerSearch && filteredProviders.length === 0 && (
            <p className="text-xs text-muted-foreground italic py-2">No providers found matching "{providerSearch}"</p>
          )}
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
