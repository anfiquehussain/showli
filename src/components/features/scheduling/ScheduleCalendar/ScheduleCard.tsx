import { Film, Tv, Clock, Check, X } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { ScheduleEntry, ScheduleStatus } from '@/types/scheduling.types';

interface ScheduleCardProps {
  schedule: ScheduleEntry;
  onStatusChange: (id: string, status: ScheduleStatus) => void;
  onDelete: (id: string) => void;
}

export const ScheduleCard = ({
  schedule,
  onStatusChange,
  onDelete,
}: ScheduleCardProps) => {
  const MediaIcon = schedule.mediaType === 'movie' ? Film : Tv;

  const formatTime = (epochMs: number): string => {
    return new Date(epochMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const getStatusStyle = (status: ScheduleStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'completed':
        return 'bg-success/10 border-success/30 text-success';
      case 'skipped':
        return 'bg-white/5 border-white/10 text-muted-foreground';
      case 'cancelled':
        return 'bg-error/10 border-error/30 text-error';
      default:
        return '';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl group hover:bg-white/10 transition-colors">
      {/* Media Thumbnail */}
      {schedule.posterPath ? (
        <img
          src={getTmdbImageUrl(schedule.posterPath, 'w92')}
          alt=""
          className="w-9 h-13 rounded-lg object-cover border border-white/10 shrink-0"
        />
      ) : (
        <div className="w-9 h-13 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
          <MediaIcon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-foreground shrink-0 flex items-center gap-1">
            <MediaIcon className="w-2.5 h-2.5" />
            {schedule.mediaType}
          </span>
          {schedule.planId && (
            <span className="text-[8px] font-bold px-1 rounded bg-brand-primary/10 border border-brand-primary/20 text-brand-primary truncate">
              Auto-Plan
            </span>
          )}
        </div>

        <h4 className="text-xs font-bold text-white truncate mt-1">
          {schedule.title}
          {schedule.seasonNumber !== null && schedule.episodeNumber !== null && (
            <span className="text-muted-foreground font-medium">
              {' '}— S{schedule.seasonNumber}E{schedule.episodeNumber}
            </span>
          )}
        </h4>

        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(schedule.startAt)} – {formatTime(schedule.endAt)}</span>
          </div>
          <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${getStatusStyle(schedule.status)}`}>
            {schedule.status}
          </span>
        </div>

        {schedule.notes && (
          <p className="text-[10px] text-muted-foreground/80 mt-1 italic line-clamp-1">
            "{schedule.notes}"
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {schedule.status === 'scheduled' && (
          <>
            <button
              onClick={() => onStatusChange(schedule.id, 'completed')}
              title="Mark Completed"
              className="p-1.5 rounded-lg bg-success/10 border border-success/20 text-success hover:bg-success/20 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onStatusChange(schedule.id, 'skipped')}
              title="Skip"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(schedule.id)}
          title="Delete Schedule"
          className="p-1.5 rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ScheduleCard;
