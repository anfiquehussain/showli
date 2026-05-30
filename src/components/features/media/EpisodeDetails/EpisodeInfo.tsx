import type { TmdbEpisode } from '@/types/tmdb.types';

interface EpisodeInfoProps {
  episode: TmdbEpisode;
}

const EpisodeInfo = ({ episode }: EpisodeInfoProps) => {
  return (
    <div className="bg-white/3 border border-white/10 rounded-3xl p-6 space-y-5">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/50 pb-2 border-b border-white/5">
        Episode Facts
      </h3>
      
      <div className="space-y-4">
        {/* Production Code */}
        {episode.production_code && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Production Code</span>
            <span className="text-sm text-white font-black font-mono uppercase tracking-wider">{episode.production_code}</span>
          </div>
        )}

        {/* Episode Type */}
        {episode.episode_type && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Episode Type</span>
            <span className="text-xs text-brand-primary font-black uppercase tracking-wider bg-brand-primary/10 px-2.5 py-1 rounded border border-brand-primary/20 w-fit">
              {episode.episode_type}
            </span>
          </div>
        )}

        {/* Season Number */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Season</span>
          <span className="text-sm text-white font-black">Season {episode.season_number}</span>
        </div>

        {/* Episode Number */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Episode Number</span>
          <span className="text-sm text-white font-black">Episode {episode.episode_number}</span>
        </div>

        {/* Average Rating */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Community Rating</span>
          <span className="text-sm text-warning font-black">{episode.vote_average?.toFixed(1) || '0.0'}/10</span>
        </div>
      </div>
    </div>
  );
};

export default EpisodeInfo;
