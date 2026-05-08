import { useGetWatchProvidersQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';
import { ExternalLink, PlayCircle } from 'lucide-react';

interface MediaWatchProvidersProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaWatchProviders = ({ id, type }: MediaWatchProvidersProps) => {
  const { data, isLoading } = useGetWatchProvidersQuery({ type, id });
  
  // For now, default to 'US'. In a real app, this would be dynamic or based on user settings.
  const providers = data?.results?.['US'];

  if (isLoading) return <div className="h-32 glass-card rounded-3xl animate-pulse" />;
  if (!providers || (!providers.flatrate && !providers.rent && !providers.buy)) return null;

  return (
    <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-6 mb-6 shadow-xl shadow-black/20">
      <div className="space-y-1.5">
        <h3 className="text-lg font-black text-white flex items-center gap-3">
          <PlayCircle className="w-5 h-5 text-brand-primary" />
          Where to Watch
        </h3>
        <div className="h-px w-8 bg-brand-primary/50 rounded-full" />
      </div>

      <div className="space-y-5">
        {/* Stream */}
        {providers.flatrate && (
          <ProviderSection label="Stream" providers={providers.flatrate} link={providers.link} />
        )}

        {/* Ads */}
        {providers.ads && (
          <ProviderSection label="Ads" providers={providers.ads} link={providers.link} />
        )}

        {/* Rent */}
        {providers.rent && (
          <ProviderSection label="Rent" providers={providers.rent} link={providers.link} />
        )}

        {/* Buy */}
        {providers.buy && (
          <ProviderSection label="Buy" providers={providers.buy} link={providers.link} />
        )}

        <div className="pt-2">
          <a 
            href={providers.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white hover:bg-brand-primary/20 hover:border-brand-primary transition-all group"
          >
            Powered by JustWatch
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
};

const ProviderSection = ({ label, providers, link }: { label: string; providers: any[]; link: string }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-brand-primary/80 whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
    <div className="flex flex-wrap gap-3">
      {providers.map(provider => (
        <a 
          key={provider.provider_id}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative"
          title={provider.provider_name}
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-white/10 group-hover:border-brand-primary/50 group-hover:scale-110 transition-all duration-300">
            <img 
              src={getTmdbImageUrl(provider.logo_path, 'w92')} 
              alt={provider.provider_name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-[9px] font-bold text-white rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-white/10">
            {provider.provider_name}
          </div>
        </a>
      ))}
    </div>
  </div>
);

export default MediaWatchProviders;
