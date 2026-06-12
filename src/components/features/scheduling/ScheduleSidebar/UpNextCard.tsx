import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { ScheduleEntry, ScheduleStatus } from '@/types/scheduling.types';

interface UpNextCardProps {
  nextItem: ScheduleEntry | null;
  onStatusChange: (id: string, status: ScheduleStatus) => void;
  onSnooze: (id: string, currentStart: number) => void;
}

export const UpNextCard = ({
  nextItem,
  onStatusChange,
  onSnooze,
}: UpNextCardProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  if (!nextItem) {
    return (
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center py-6">
        <Play className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" aria-hidden="true" />
        <p className="text-xs font-bold text-white/50">Your Queue is Empty</p>
        <p className="text-[10px] text-muted-foreground mt-1">Schedule a movie or TV show to begin tracking!</p>
      </div>
    );
  }

  const diff = nextItem.startAt - now;
  const isCurrent = diff <= 0;

  const remainingText = isCurrent
    ? 'NOW PLAYING'
    : (() => {
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `Starts in ${days}d ${hours % 24}h`;
        if (hours > 0) return `Starts in ${hours}h ${mins % 60}m`;
        return `Starts in ${mins}m`;
      })();

  const getDetailsUrl = () => {
    if (nextItem.mediaType === 'movie') {
      return `/movie/${nextItem.tmdbId}`;
    }
    if (nextItem.mediaType === 'tv') {
      return `/tv/${nextItem.tmdbId}`;
    }
    if (nextItem.mediaType === 'episode' && nextItem.parentSeriesId) {
      return `/tv/${nextItem.parentSeriesId}/season/${nextItem.seasonNumber}/episode/${nextItem.episodeNumber}`;
    }
    return null;
  };

  const detailsUrl = getDetailsUrl();

  return (
    <div className="bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-4 space-y-3 transition-all relative overflow-hidden">
      <div className="flex gap-3">
        {/* Poster */}
        {detailsUrl ? (
          <Link
            to={detailsUrl}
            className="w-12 h-18 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-950 block hover:ring-2 hover:ring-brand-primary/50 transition-all"
            title="View Details"
          >
            {nextItem.posterPath ? (
              <img
                src={getTmdbImageUrl(nextItem.posterPath, 'w92')}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </Link>
        ) : (
          nextItem.posterPath ? (
            <img
              src={getTmdbImageUrl(nextItem.posterPath, 'w92')}
              alt=""
              className="w-12 h-18 rounded-lg object-cover border border-white/10 shrink-0"
              aria-hidden="true"
            />
          ) : (
            <div className="w-12 h-18 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/10 shrink-0">
              <Clock className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </div>
          )
        )}

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-black text-brand-primary uppercase tracking-wider block">
              UPCOMING SESSION
            </span>
            <h4 className="text-xs font-bold text-white truncate">
              {detailsUrl ? (
                <Link to={detailsUrl} className="hover:text-brand-primary transition-colors">
                  {nextItem.title}
                </Link>
              ) : (
                nextItem.title
              )}
            </h4>
            {nextItem.seasonNumber !== null && nextItem.episodeNumber !== null && (
              <p className="text-[10px] text-muted-foreground truncate font-semibold">
                Season {nextItem.seasonNumber}, Episode {nextItem.episodeNumber}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
              isCurrent 
                ? 'bg-success/10 border-success/20 text-success animate-pulse' 
                : 'bg-brand-secondary/10 border-brand-secondary/20 text-brand-secondary'
            }`}>
              {remainingText}
            </span>
          </div>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-2 pt-1.5 border-t border-white/5">
        <button
          onClick={() => onStatusChange(nextItem.id, 'completed')}
          className="flex-1 py-1.5 text-[10px] font-bold text-success bg-success/5 border border-success/20 hover:bg-success/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
          aria-label="Mark Watched"
        >
          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Watched</span>
        </button>
        <button
          onClick={() => onSnooze(nextItem.id, nextItem.startAt)}
          className="flex-1 py-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary/5 border border-brand-primary/20 hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
          aria-label="Delay 15 Minutes"
        >
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Snooze 15m</span>
        </button>
        <button
          onClick={() => onStatusChange(nextItem.id, 'skipped')}
          className="py-1.5 px-2.5 text-[10px] font-bold text-muted-foreground hover:text-white bg-white/5 border border-white/10 hover:bg-white/8 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title="Skip Episode"
          aria-label="Skip Episode"
        >
          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default UpNextCard;
