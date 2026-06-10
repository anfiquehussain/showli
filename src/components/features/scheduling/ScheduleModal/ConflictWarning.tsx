import { AlertTriangle, Clock, Film, Tv } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { ScheduleConflict } from '@/types/scheduling.types';

interface ConflictWarningProps {
  conflicts: ScheduleConflict[];
  isChecking: boolean;
}

/**
 * Displays conflict details when a scheduling overlap is detected.
 */
const ConflictWarning = ({ conflicts, isChecking }: ConflictWarningProps) => {
  if (isChecking) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin shrink-0" />
        <span className="text-xs text-muted-foreground">Checking for conflicts…</span>
      </div>
    );
  }

  if (conflicts.length === 0) return null;

  const formatTime = (epochMs: number): string => {
    const date = new Date(epochMs);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (epochMs: number): string => {
    const date = new Date(epochMs);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-2">
      {/* Warning Banner */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-error/10 border border-error/20">
        <AlertTriangle className="w-4 h-4 text-error shrink-0" aria-hidden="true" />
        <span className="text-xs font-bold text-error">
          {conflicts.length} scheduling {conflicts.length === 1 ? 'conflict' : 'conflicts'} detected
        </span>
      </div>

      {/* Conflict Details */}
      <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
        {conflicts.map((conflict) => {
          const MediaIcon = conflict.entry.mediaType === 'movie' ? Film : Tv;

          return (
            <div
              key={conflict.entry.id}
              className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10"
            >
              {/* Poster Thumbnail */}
              {conflict.entry.posterPath ? (
                <img
                  src={getTmdbImageUrl(conflict.entry.posterPath, 'w92')}
                  alt=""
                  className="w-8 h-12 rounded-md object-cover shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <div className="w-8 h-12 rounded-md bg-white/10 flex items-center justify-center shrink-0">
                  <MediaIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                </div>
              )}

              {/* Conflict Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {conflict.entry.title}
                  {conflict.entry.seasonNumber !== null && conflict.entry.episodeNumber !== null && (
                    <span className="text-muted-foreground font-medium">
                      {' '} — S{conflict.entry.seasonNumber}E{conflict.entry.episodeNumber}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-muted-foreground" aria-hidden="true" />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {formatDate(conflict.entry.startAt)} · {formatTime(conflict.entry.startAt)} – {formatTime(conflict.entry.endAt)}
                  </span>
                </div>
              </div>

              {/* Overlap Duration Badge */}
              <div className="shrink-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-error bg-error/10 px-2 py-0.5 rounded-md border border-error/20">
                  {Math.round((conflict.overlapEnd - conflict.overlapStart) / 60000)} min overlap
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggestion */}
      {conflicts.length > 0 && (
        <p className="text-[10px] text-muted-foreground italic px-1">
          Try scheduling after{' '}
          <span className="text-white font-medium">
            {formatTime(Math.max(...conflicts.map(c => c.entry.endAt)))}
          </span>
          {' '}to avoid conflicts.
        </p>
      )}
    </div>
  );
};

export default ConflictWarning;
