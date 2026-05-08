import { 
  Info, 
  Globe, 
  TrendingUp, 
  Users, 
  Building2, 
  Wallet, 
  DollarSign, 
  Play, 
  Clock,
  Calendar,
  Monitor,
  Type
} from 'lucide-react';
import type { 
  TmdbMovieDetails, 
  TmdbTVDetails, 
  TmdbProductionCompany, 
  TmdbSpokenLanguage,
  TmdbNetwork
} from '@/types/tmdb.types';

interface MediaQuickFactsProps {
  media: TmdbMovieDetails | TmdbTVDetails;
  type: 'movie' | 'tv';
}

const MediaQuickFacts = ({ media, type }: MediaQuickFactsProps) => {
  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

  const getFullLanguage = (code: string) => {
    try {
      return languageNames.of(code) || code.toUpperCase();
    } catch {
      return code.toUpperCase();
    }
  };

  const getFullCountry = (code: string) => {
    try {
      return regionNames.of(code) || code;
    } catch {
      return code;
    }
  };

  const formatRuntime = (minutes: number | null | undefined) => {
    if (!minutes) return 'N/A';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const originCountry = type === 'tv' 
    ? (media as TmdbTVDetails).origin_country?.[0]
    : (media as TmdbMovieDetails).production_countries?.[0]?.iso_3166_1;

  const originalTitle = 'original_title' in media ? media.original_title : media.original_name;
  const currentTitle = 'title' in media ? media.title : media.name;
  const showOriginalTitle = originalTitle && originalTitle !== currentTitle;

  const runtime = type === 'movie' 
    ? (media as TmdbMovieDetails).runtime 
    : (media as TmdbTVDetails).episode_run_time?.[0];

  const releaseDate = type === 'movie'
    ? (media as TmdbMovieDetails).release_date
    : (media as TmdbTVDetails).first_air_date;

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-lg font-black text-white flex items-center gap-3">
          <Info className="w-4 h-4 text-brand-primary" />
          Quick Facts
        </h3>
        <div className="h-px w-8 bg-brand-primary/50 rounded-full" />
      </div>

      <div className="space-y-6">
        {/* 1. General Section */}
        <section className="space-y-3">
          <SectionHeader label="General Information" />
          <div className="space-y-3">
            {showOriginalTitle && (
              <FactItem icon={Type} label="Original Title" value={originalTitle} />
            )}
            <FactItem icon={Globe} label="Original Language" value={getFullLanguage(media.original_language)} />
            {originCountry && (
              <FactItem 
                icon={Globe} 
                label="Origin Country" 
                value={getFullCountry(originCountry)} 
              />
            )}
            <FactItem icon={Clock} label="Runtime" value={formatRuntime(runtime)} />
            <FactItem 
              icon={Calendar} 
              label={type === 'movie' ? "Release Date" : "First Air Date"} 
              value={formatDate(releaseDate)} 
            />
            <FactItem icon={Clock} label="Status" value={media.status} />
          </div>
        </section>

        {/* 2. Content Specific Section (Series or Financials) */}
        {type === 'tv' ? (
          <section className="space-y-3">
            <SectionHeader label="Series Details" />
            <div className="space-y-3">
              <FactItem icon={Info} label="Seasons" value={(media as TmdbTVDetails).number_of_seasons} />
              <FactItem icon={Play} label="Episodes" value={(media as TmdbTVDetails).number_of_episodes} />
              <FactItem 
                icon={Calendar} 
                label="Last Air Date" 
                value={formatDate((media as TmdbTVDetails).last_air_date)} 
              />
              {'networks' in media && media.networks.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2.5 text-muted-foreground opacity-70">
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Networks</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pl-[26px]">
                    {media.networks.map((network: TmdbNetwork) => (
                      <span key={network.id} className="text-[10px] font-bold text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {network.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-3">
            <SectionHeader label="Financial Information" />
            <div className="space-y-3">
              <FactItem 
                icon={Wallet} 
                label="Budget" 
                value={(media as TmdbMovieDetails).budget > 0 ? `$${(media as TmdbMovieDetails).budget.toLocaleString()}` : "N/A"} 
              />
              <FactItem 
                icon={DollarSign} 
                label="Revenue" 
                value={(media as TmdbMovieDetails).revenue > 0 ? `$${(media as TmdbMovieDetails).revenue.toLocaleString()}` : "N/A"} 
              />
            </div>
          </section>
        )}

        {/* 3. Community Section */}
        <section className="space-y-3">
          <SectionHeader label="Community Stats" />
          <div className="space-y-3">
            <FactItem 
              icon={TrendingUp} 
              label="Popularity" 
              value={media.popularity.toLocaleString(undefined, { maximumFractionDigits: 0 })} 
            />
            <FactItem icon={Users} label="Votes" value={media.vote_count.toLocaleString()} />
          </div>
        </section>

        {/* 4. Production & Tech Section */}
        <section className="space-y-3">
          <SectionHeader label="Production & Technical" />
          <div className="space-y-4">
            {/* Languages */}
            {media.spoken_languages && media.spoken_languages.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-muted-foreground opacity-70">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Spoken Languages</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-[26px]">
                  {media.spoken_languages.map((lang: TmdbSpokenLanguage) => (
                    <span key={lang.iso_639_1} className="text-[10px] font-bold text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {lang.english_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Production */}
            {media.production_companies && media.production_companies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-muted-foreground opacity-70">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Production Companies</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-[26px]">
                  {media.production_companies.map((company: TmdbProductionCompany) => (
                    <span key={company.id} className="text-[10px] font-bold text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/5 hover:text-white transition-colors">
                      {company.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 pb-1">
    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-brand-primary/90">{label}</span>
    <div className="h-[1px] flex-1 bg-white/10" />
  </div>
);

interface FactItemProps {
  icon: any;
  label: string;
  value: string | number;
}

const FactItem = ({ icon: Icon, label, value }: FactItemProps) => (
  <div className="flex justify-between items-center group">
    <div className="flex items-center gap-2.5 text-muted-foreground group-hover:text-white transition-colors">
      <Icon className="w-3.5 h-3.5 opacity-60" />
      <span className="text-[12px] font-bold uppercase tracking-tight opacity-70">{label}</span>
    </div>
    <span className="text-white text-[12px] font-black bg-white/5 px-2 py-0.5 rounded border border-white/5">
      {value}
    </span>
  </div>
);


export default MediaQuickFacts;

