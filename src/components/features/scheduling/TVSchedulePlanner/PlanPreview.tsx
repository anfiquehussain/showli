import { useMemo } from 'react';
import { AlertTriangle, Calendar, Tv } from 'lucide-react';
import type { PreviewScheduleEntry, ScheduleConflict, TVPlanConfig } from '@/types/scheduling.types';

interface PlanPreviewProps {
  config: TVPlanConfig;
  previewEntries: PreviewScheduleEntry[];
  onTimeChange: (index: number, newTimeStr: string) => void;
  onDateChange: (index: number, newDateStr: string) => void;
}

export const PlanPreview = ({
  config,
  previewEntries,
  onTimeChange,
  onDateChange,
}: PlanPreviewProps) => {
  const getLocalDateString = (epochMs: number): string => {
    const d = new Date(epochMs);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getLocalTimeString = (epochMs: number): string => {
    const d = new Date(epochMs);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const formatDateReadable = (epochMs: number): string => {
    const d = new Date(epochMs);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime12 = (timeStr: string): string => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    if (h === undefined || m === undefined) return timeStr;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  };

  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activeDaysList = (config.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6])
    .map(day => DAYS_SHORT[day])
    .join(', ');

  const startTimestamp = previewEntries.length > 0 ? previewEntries[0]?.entry.startAt : null;
  const endTimestamp = previewEntries.length > 0 ? previewEntries[previewEntries.length - 1]?.entry.startAt : null;

  // Group preview entries by local date keys to see how many episodes fall on each day
  const dailyCounts = useMemo(() => {
    const countsMap: Record<string, number> = {};
    previewEntries.forEach(({ entry }) => {
      const d = new Date(entry.startAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      countsMap[dateKey] = (countsMap[dateKey] || 0) + 1;
    });
    return Object.values(countsMap);
  }, [previewEntries]);

  const episodesPerDayText = useMemo(() => {
    if (dailyCounts.length === 0) return '0 ep / day';
    const min = Math.min(...dailyCounts);
    const max = Math.max(...dailyCounts);
    if (min === max) {
      return `${min} ep / day`;
    }
    return `${min}–${max} ep / day`;
  }, [dailyCounts]);

  return (
    <div className="space-y-4">
      {/* Plan Summary Card */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
          <Tv className="w-3.5 h-3.5" />
          Planned Configuration Summary
        </h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Pacing Mode</span>
            <span className="text-white font-bold uppercase tracking-wider text-[11px]">
              {config.mode === 'daily' ? 'Daily Goal' : 'Target Deadline'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Episodes Per Day</span>
            <span className="text-brand-secondary font-black text-[11px]">
              {episodesPerDayText}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Active Weekdays</span>
            <span className="text-white font-bold truncate block" title={activeDaysList}>
              {activeDaysList}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Preferred Start Time</span>
            <span className="text-white font-bold">
              {formatTime12(config.preferredTime)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] text-muted-foreground block">Break Duration</span>
            <span className="text-white font-bold">
              {config.breakMinutes ?? 0} mins
            </span>
          </div>

          {config.mode === 'daily' && config.episodeTimes && config.episodeTimes.length > 0 && (
            <div className="space-y-0.5 col-span-2 border-t border-white/5 pt-2">
              <span className="text-[10px] text-muted-foreground block">Daily Viewing Times</span>
              <span className="text-white font-semibold flex flex-wrap gap-1.5 mt-0.5">
                {config.episodeTimes.map((time, idx) => (
                  <span key={idx} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[10px]">
                    Ep {idx + 1}: {formatTime12(time)}
                  </span>
                ))}
              </span>
            </div>
          )}

          {startTimestamp && endTimestamp && (
            <div className="space-y-0.5 col-span-2 border-t border-white/5 pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-muted-foreground block">Watch Timeline</span>
                <span className="text-white font-bold flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                  {formatDateReadable(startTimestamp)} – {formatDateReadable(endTimestamp)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Total Episodes</span>
                <span className="text-brand-secondary font-black text-sm">
                  {previewEntries.length} EPISODES
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Episode Schedule Details
          </span>
          <span className="text-[10px] text-muted-foreground">
            Customize individual times below
          </span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
          {previewEntries.map((preview, idx) => {
            const hasConflicts = preview.conflicts.length > 0;
            return (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                  hasConflicts
                    ? 'bg-error/5 border-error/20 hover:bg-error/10'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20 uppercase shrink-0">
                      S{preview.entry.seasonNumber}E{preview.entry.episodeNumber}
                    </span>
                    <h4 className="text-xs font-bold text-white truncate">
                      {preview.entry.episodeTitle}
                    </h4>
                  </div>

                  {hasConflicts && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-error">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[10px] font-semibold truncate">
                        Conflicts with {preview.conflicts.map((c: ScheduleConflict) => c.entry.title).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Edit inputs for time & date override */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="date"
                    value={getLocalDateString(preview.entry.startAt)}
                    onChange={(e) => onDateChange(idx, e.target.value)}
                    className="px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg text-[11px] text-white hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-brand-primary/50"
                  />
                  <input
                    type="time"
                    value={getLocalTimeString(preview.entry.startAt)}
                    onChange={(e) => onTimeChange(idx, e.target.value)}
                    className="px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg text-[11px] text-white hover:bg-white/5 focus-visible:ring-1 focus-visible:ring-brand-primary/50"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

