import { useState } from 'react';
import Modal from '@/components/patterns/Modal';
import { useGetTVSeasonDetailsQuery } from '@/api/media/mediaApi';
import type { TmdbTVSeasonBrief } from '@/types/tmdb.types';
import { clsx } from 'clsx';
import { Layers, Info } from 'lucide-react';

interface EpisodeRatingsModalProps {
  tvId: number;
  seasons: TmdbTVSeasonBrief[];
  isOpen: boolean;
  onClose: () => void;
  showTitle: string;
}

const getRatingColorClass = (rating: number): string => {
  if (!rating || rating === 0) return 'bg-white/5 border-white/10 text-muted-foreground';
  if (rating >= 9.8) return 'bg-rating-masterpiece border-rating-masterpiece/20 text-zinc-950 shadow-[0_2px_8px_rgba(6,182,212,0.3)] font-bold';
  if (rating >= 9.5) return 'bg-rating-awesome border-rating-awesome/20 text-white shadow-[0_2px_8px_rgba(21,128,61,0.25)]';
  if (rating >= 9.0) return 'bg-rating-great border-rating-great/20 text-white shadow-[0_2px_8px_rgba(34,197,94,0.25)]';
  if (rating >= 8.0) return 'bg-rating-good border-rating-good/20 text-zinc-950 shadow-[0_2px_8px_rgba(234,179,8,0.25)] font-bold';
  if (rating >= 6.0) return 'bg-rating-regular border-rating-regular/20 text-white shadow-[0_2px_8px_rgba(249,115,22,0.25)]';
  if (rating >= 5.0) return 'bg-rating-bad border-rating-bad/20 text-white shadow-[0_2px_8px_rgba(239,68,68,0.25)]';
  return 'bg-rating-garbage border-rating-garbage/20 text-white shadow-[0_2px_8px_rgba(107,33,168,0.25)]';
};

const getRatingLabel = (rating: number): string => {
  if (!rating || rating === 0) return 'N/A';
  if (rating >= 9.8) return 'Masterpiece';
  if (rating >= 9.5) return 'Awesome';
  if (rating >= 9.0) return 'Great';
  if (rating >= 8.0) return 'Good';
  if (rating >= 6.0) return 'Regular';
  if (rating >= 5.0) return 'Bad';
  return 'Garbage';
};

interface SeasonRatingsSectionProps {
  tvId: number;
  seasonNumber: number;
  seasonName: string;
}

const SeasonRatingsSection = ({ tvId, seasonNumber, seasonName }: SeasonRatingsSectionProps) => {
  const { data: seasonDetails, isLoading } = useGetTVSeasonDetailsQuery({
    tvId,
    seasonNumber
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[54px] bg-white/3 border border-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!seasonDetails || !seasonDetails.episodes || seasonDetails.episodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-black text-brand-primary uppercase tracking-[0.2em] flex items-center gap-2">
        <span className="w-1.5 h-3 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
        {seasonName}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {seasonDetails.episodes.map((episode) => {
          const rating = episode.vote_average || 0;
          const colorClass = getRatingColorClass(rating);
          const label = getRatingLabel(rating);

          return (
            <div 
              key={episode.id}
              className="flex items-center justify-between p-3 bg-white/3 hover:bg-white/6 border border-white/5 rounded-xl transition-colors duration-300 group"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                  Episode {episode.episode_number}
                </span>
                <span className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                  {episode.name}
                </span>
              </div>
              <div className={clsx(
                "flex flex-col items-center justify-center shrink-0 px-2 py-0.5 rounded-lg border text-center min-w-[64px] transition-transform duration-300 hover:scale-105",
                colorClass
              )}>
                <span className="text-[11px] font-black leading-none">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
                <span className="text-[6.5px] font-black uppercase tracking-wider mt-0.5 opacity-90">{label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EpisodeRatingsModal = ({ tvId, seasons, isOpen, onClose, showTitle }: EpisodeRatingsModalProps) => {
  const sortedSeasons = [...seasons]
    .filter(s => s.season_number > 0) // Hide specials in the matrix for clean overview, or keep them if needed
    .sort((a, b) => a.season_number - b.season_number);

  const [activeTab, setActiveTab] = useState<number | 'all'>('all');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${showTitle} — Episode Ratings`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Visual Color Legend matching user screenshot exactly */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-3.5 border-y border-white/5">
          {[
            { label: 'Masterpiece', dotColor: 'bg-rating-masterpiece shadow-[0_0_8px_rgba(6,182,212,0.6)]', range: '≥ 9.8' },
            { label: 'Awesome', dotColor: 'bg-rating-awesome shadow-[0_0_8px_rgba(21,128,61,0.6)]', range: '9.5 - 9.7' },
            { label: 'Great', dotColor: 'bg-rating-great shadow-[0_0_8px_rgba(34,197,94,0.6)]', range: '9.0 - 9.4' },
            { label: 'Good', dotColor: 'bg-rating-good shadow-[0_0_8px_rgba(234,179,8,0.6)]', range: '8.0 - 8.9' },
            { label: 'Regular', dotColor: 'bg-rating-regular shadow-[0_0_8px_rgba(249,115,22,0.6)]', range: '6.0 - 7.9' },
            { label: 'Bad', dotColor: 'bg-rating-bad shadow-[0_0_8px_rgba(239,68,68,0.6)]', range: '5.0 - 5.9' },
            { label: 'Garbage', dotColor: 'bg-rating-garbage shadow-[0_0_8px_rgba(107,33,168,0.6)]', range: '< 5.0' }
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-white/90">
              <span className={clsx("w-2.5 h-2.5 rounded-full shrink-0", item.dotColor)} />
              <span>{item.label}</span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">({item.range})</span>
            </div>
          ))}
        </div>

        {/* Info Notice Sourcing ratings from TMDb */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-info-bg border border-info/20 text-info text-xs font-semibold select-none">
          <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>These episode ratings are sourced from TMDb (The Movie Database).</span>
        </div>

        {/* Season Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
          <button
            onClick={() => setActiveTab('all')}
            className={clsx(
              "px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap border shrink-0 flex items-center gap-1.5",
              activeTab === 'all'
                ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            All Seasons
          </button>
          {sortedSeasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setActiveTab(season.season_number)}
              className={clsx(
                "px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap border shrink-0",
                activeTab === season.season_number
                  ? "bg-brand-primary text-white border-brand-primary shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                  : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              {season.name}
            </button>
          ))}
        </div>

        {/* Ratings Grid / List */}
        <div className="space-y-8 max-h-[55vh] overflow-y-auto pr-1.5 custom-scrollbar">
          {activeTab === 'all' ? (
            sortedSeasons.map((season) => (
              <SeasonRatingsSection
                key={season.id}
                tvId={tvId}
                seasonNumber={season.season_number}
                seasonName={season.name}
              />
            ))
          ) : (
            (() => {
              const activeSeason = sortedSeasons.find(s => s.season_number === activeTab);
              return activeSeason ? (
                <SeasonRatingsSection
                  tvId={tvId}
                  seasonNumber={activeSeason.season_number}
                  seasonName={activeSeason.name}
                />
              ) : null;
            })()
          )}
        </div>
      </div>
    </Modal>
  );
};

export default EpisodeRatingsModal;
