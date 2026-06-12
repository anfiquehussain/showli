import { Film, Tv, Check, FastForward, Calendar, Trash2, AlertTriangle, Clock } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { ScheduleEntry, ScheduleStatus } from '@/types/scheduling.types';

interface TimelineItemProps {
  schedule: ScheduleEntry;
  conflictingSchedules: ScheduleEntry[];
  onStatusChange: (id: string, status: ScheduleStatus) => void;
  onRescheduleClick: (schedule: ScheduleEntry) => void;
  onDeleteClick: (id: string) => void;
}

export const TimelineItem = ({
  schedule,
  conflictingSchedules,
  onStatusChange,
  onRescheduleClick,
  onDeleteClick,
}: TimelineItemProps) => {
  const isMovie = schedule.mediaType === 'movie';
  const MediaIcon = isMovie ? Film : Tv;
  const isCompleted = schedule.status === 'completed';
  const isSkipped = schedule.status === 'skipped';
  const isCancelled = schedule.status === 'cancelled';
  const isScheduled = schedule.status === 'scheduled';

  const formatTime = (epochMs: number): string => {
    return new Date(epochMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const hasConflicts = conflictingSchedules.length > 0;

  return (
    <div className="flex items-center gap-4 group">
      {/* 1. Time Column (Hidden on mobile) */}
      <div className="hidden sm:flex flex-col items-end shrink-0 w-16 select-none">
        <span className="text-xs font-black text-white tabular-nums tracking-wide">
          {formatTime(schedule.startAt)}
        </span>
        <span className="text-[9px] text-muted-foreground/60 font-bold tracking-tight">
          {formatTime(schedule.endAt)}
        </span>
      </div>

      {/* 2. Visual Timeline Dot Indicator (Hidden on mobile) */}
      <div className="hidden sm:flex relative self-stretch flex-col items-center">
        <div className={`w-3 h-3 rounded-full border-2 ${
          hasConflicts && isScheduled
            ? 'bg-warning border-warning/50'
            : isCompleted
              ? 'bg-success border-success/50'
              : 'bg-brand-primary border-brand-primary/50'
        } z-10 shrink-0 mt-4`} />
        <div className="w-0.5 flex-1 bg-white/5 group-last:bg-transparent" />
      </div>

      {/* 3. Redesigned Premium Card Content */}
      <div className={`flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white/3 border rounded-2xl transition-all gap-3 ${
        hasConflicts && isScheduled
          ? 'border-warning/30 bg-warning/3 shadow-md shadow-warning/1'
          : 'border-white/5 hover:bg-white/6 hover:border-white/10 hover:shadow-lg hover:shadow-black/5'
      }`}>
        
        {/* Left Side: Thumbnail & Details */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Thumbnail */}
          <div className="w-10 h-15 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-950 shadow-md">
            {schedule.posterPath ? (
              <img
                src={getTmdbImageUrl(schedule.posterPath, 'w92')}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                aria-hidden="true"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-[8px] font-bold uppercase">No Poster</div>
            )}
          </div>

          {/* Details Column */}
          <div className="min-w-0 space-y-1 flex-1">
            {/* Badges Row (Horizontal, Clean) */}
            <div className="flex items-center flex-wrap gap-1.5 select-none">
              {/* Mobile Time Badge */}
              <span className="inline-flex sm:hidden text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shrink-0 items-center gap-1">
                <Clock className="w-2.5 h-2.5" aria-hidden="true" />
                {formatTime(schedule.startAt)} – {formatTime(schedule.endAt)}
              </span>

              <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground shrink-0 flex items-center gap-1">
                <MediaIcon className="w-2.5 h-2.5" aria-hidden="true" />
                {schedule.mediaType}
              </span>

              {schedule.planId && (
                <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-primary/15 border border-brand-primary/20 text-brand-primary shrink-0">
                  Binge Plan
                </span>
              )}

              {/* Status Indicator */}
              <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                isCompleted
                  ? 'bg-success/15 border-success/20 text-success'
                  : isSkipped
                    ? 'bg-white/5 border-white/10 text-muted-foreground'
                    : isCancelled
                      ? 'bg-error/15 border-error/20 text-error'
                      : 'bg-brand-secondary/15 border-brand-secondary/20 text-brand-secondary'
              }`}>
                {schedule.status}
              </span>
            </div>

            {/* Title / Episode info */}
            <h4 className="text-xs sm:text-sm font-bold text-white truncate pr-2">
              {schedule.title}
              {schedule.seasonNumber !== null && schedule.episodeNumber !== null && (
                <span className="text-muted-foreground font-semibold">
                  {' '}— S{schedule.seasonNumber}E{schedule.episodeNumber}
                </span>
              )}
            </h4>

            {schedule.episodeTitle && (
              <p className="text-xs text-muted-foreground/80 truncate font-semibold">
                "{schedule.episodeTitle}"
              </p>
            )}

            {schedule.notes && (
              <p className="text-[10px] text-muted-foreground/60 italic truncate">
                Note: {schedule.notes}
              </p>
            )}

            {/* Overlap Alarm */}
            {hasConflicts && isScheduled && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-warning pt-0.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  Conflict detected
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side/Bottom: Quick Action Icon Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 justify-end border-t border-white/5 pt-2 sm:border-t-0 sm:pt-0 sm:ml-3">
          {isScheduled && (
            <>
              <button
                onClick={() => onStatusChange(schedule.id, 'completed')}
                className="p-2 rounded-xl bg-success/5 border border-success/20 hover:bg-success/25 hover:border-success/30 text-success transition-all cursor-pointer"
                title="Mark Watched"
                aria-label="Mark Watched"
              >
                <Check className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onStatusChange(schedule.id, 'skipped')}
                className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 text-muted-foreground hover:text-white transition-all cursor-pointer"
                title="Skip Session"
                aria-label="Skip Session"
              >
                <FastForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onRescheduleClick(schedule)}
                className="p-2 rounded-xl bg-brand-primary/5 border border-brand-primary/20 hover:bg-brand-primary/20 hover:border-brand-primary/30 text-brand-primary transition-all cursor-pointer"
                title="Reschedule Session"
                aria-label="Reschedule Session"
              >
                <Calendar className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => onDeleteClick(schedule.id)}
            className="p-2 rounded-xl bg-error/5 border border-error/20 hover:bg-error/20 hover:border-error/30 text-error transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            title="Delete Schedule"
            aria-label="Delete Schedule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TimelineItem;
