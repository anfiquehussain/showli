import { useNavigate } from 'react-router-dom';
import { useGetAvailableWatchProvidersQuery } from '@/api/media/mediaApi';
import ScrollContainer from '@/components/patterns/ScrollContainer';

import DynamicCard from './DynamicCard';
import ProviderCard from './ProviderCard';
import StudioCard from './StudioCard';
import CountryCard from './CountryCard';
import TimePeriodCard from './TimePeriodCard';
import LanguageCard from './LanguageCard';
import { 
  CATEGORIES, 
  POPULAR_COMPANIES, 
  POPULAR_COUNTRIES, 
  POPULAR_LANGUAGES, 
  POPULAR_YEARS 
} from './constants';

const QuickBrowseHub = () => {
  const navigate = useNavigate();
  
  // Fetch watch provider data to get logo paths
  const { data: providersData } = useGetAvailableWatchProvidersQuery({ 
    type: 'movie', 
    region: 'US' 
  });

  return (
    <section className="space-y-10 py-4">
      {/* 1. Genres Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Browse Genres
            </h2>
            <p className="text-[10px] text-muted-foreground">Find films tailored to your favorite styles.</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 cursor-pointer"
          >
            View All
          </button>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {CATEGORIES.map((cat) => (
            <DynamicCard
              key={cat.id}
              name={cat.name}
              icon={cat.icon}
              color={cat.color}
              discoverParams={{ with_genres: cat.genreId }}
              onClick={() => navigate(`/browse?genre=${cat.genreId}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 2. Streaming Providers Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-secondary rounded-full shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              Streaming Services
            </h2>
            <p className="text-[10px] text-muted-foreground">Explore what is playing on your favorite platforms.</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 cursor-pointer"
          >
            View All
          </button>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {(providersData?.results
            ? [...providersData.results]
                .sort((a, b) => a.display_priority - b.display_priority)
                .slice(0, 24)
            : []
          ).map((provider) => (
            <ProviderCard
              key={provider.provider_id}
              name={provider.provider_name}
              logoPath={provider.logo_path}
              onClick={() => navigate(`/browse?provider=${provider.provider_id}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 3. Production Companies Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-brand-accent rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
              Studios & Brands
            </h2>
            <p className="text-[10px] text-muted-foreground">Browse masterpieces from popular production houses.</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 cursor-pointer"
          >
            View All
          </button>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {POPULAR_COMPANIES.map((company) => (
            <StudioCard
              key={company.id}
              name={company.name}
              logoPath={company.logoPath}
              invertLogo={company.invertLogo}
              onClick={() => navigate(`/browse?company=${company.id}&companyName=${encodeURIComponent(company.name)}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 4. Origin Countries Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-palette-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              Origin Countries
            </h2>
            <p className="text-[10px] text-muted-foreground">Discover stories from around the globe.</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 cursor-pointer"
          >
            View All
          </button>
        </div>
        <ScrollContainer className="gap-4 py-2 px-1.5" showButtons={true}>
          {POPULAR_COUNTRIES.map((country) => (
            <CountryCard
              key={country.code}
              code={country.code}
              name={country.name}
              onClick={() => navigate(`/browse?country=${country.code}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 5. Languages Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-palette-amber rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              Original Languages
            </h2>
            <p className="text-[10px] text-muted-foreground">Filter cinema by original audio language.</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 cursor-pointer"
          >
            View All
          </button>
        </div>
        <ScrollContainer className="gap-3 pb-2" showButtons={true}>
          {POPULAR_LANGUAGES.map((lang) => (
            <LanguageCard
              key={lang.code}
              code={lang.code}
              name={lang.name}
              onClick={() => navigate(`/browse?language=${lang.code}`)}
            />
          ))}
        </ScrollContainer>
      </div>

      {/* 6. Release Years & Decades Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex flex-col">
            <h2 className="text-sm md:text-base font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-palette-rose rounded-full shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              Time Periods
            </h2>
            <p className="text-[10px] text-muted-foreground">Travel back in time to different cinema eras.</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 cursor-pointer"
          >
            View All
          </button>
        </div>
        <ScrollContainer className="gap-4 py-2 px-1.5" showButtons={true}>
          {POPULAR_YEARS.map((year) => (
            <TimePeriodCard
              key={year.id}
              id={year.id}
              name={year.name}
              type={year.type}
              value={year.value}
              onClick={() => navigate(`/browse?year=${year.value}`)}
            />
          ))}
        </ScrollContainer>
      </div>
    </section>
  );
};

export default QuickBrowseHub;
