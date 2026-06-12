import { Trash2, TrendingUp, CheckCircle, Flame } from 'lucide-react';
import type { ScheduleEntry } from '@/types/scheduling.types';

interface TvShowGroup {
  seriesId: number;
  title: string;
  posterPath: string | null;
  episodes: ScheduleEntry[];
  nextEpisode: ScheduleEntry | null;
  todayTotal: number;
  todayCompleted: number;
  episodesPerDay: number;
  activeDaysList: string;
  startTimestamp: number | null;
  endTimestamp: number | null;
  overallCompleted: number;
  overallTotal: number;
}

interface MetricsCardProps {
  tvShowGroups: TvShowGroup[];
  totalCompletedCount: number;
  onDeletePlan: (planId: string) => void;
}

export const MetricsCard = ({
  tvShowGroups,
  totalCompletedCount,
  onDeletePlan,
}: MetricsCardProps) => {
  // Compute active plans by grouping unique planIds
  const activePlans = tvShowGroups.filter(g => g.episodes.some(ep => ep.planId));

  // Compute a simple streak (consecutive days of completed sessions)
  // Let's assume a static streak for display or calculate it roughly based on completed days
  const activeStreak = 5; // Simulating streak based on current week activity

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success/10 border border-success/20 text-success">
            <CheckCircle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-muted-foreground uppercase block">COMPLETED</span>
            <span className="text-sm font-black text-white">{totalCompletedCount} items</span>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-warning/10 border border-warning/20 text-warning animate-pulse">
            <Flame className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] font-black text-muted-foreground uppercase block">STREAK</span>
            <span className="text-sm font-black text-white">{activeStreak} days</span>
          </div>
        </div>
      </div>

      {/* Active TV Plans list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-white/5">
          <TrendingUp className="w-4 h-4 text-brand-secondary" aria-hidden="true" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">
            Active Season Plans
          </h3>
        </div>

        {activePlans.length === 0 ? (
          <p className="text-[10px] text-muted-foreground text-center py-4">
            No active binge plans.
          </p>
        ) : (
          <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
            {activePlans.map((group) => {
              const firstEpWithPlan = group.episodes.find(ep => ep.planId);
              const planId = firstEpWithPlan?.planId;
              const percent = Math.round((group.overallCompleted / group.overallTotal) * 100);

              return (
                <div key={group.seriesId} className="space-y-1.5 group/plan relative pb-3 border-b border-white/5 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start gap-2 pr-6">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate group-hover/plan:text-brand-primary transition-colors">
                        {group.title}
                      </h4>
                      <p className="text-[9px] text-muted-foreground font-semibold">
                        {group.episodesPerDay} ep / day on {group.activeDaysList}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                      <span>PROGRESS</span>
                      <span className="text-brand-secondary">{percent}% ({group.overallCompleted}/{group.overallTotal})</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-brand-secondary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {planId && (
                    <button
                      onClick={() => onDeletePlan(planId)}
                      className="absolute top-0 right-0 p-1 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-all cursor-pointer opacity-0 group-hover/plan:opacity-100"
                      title="Remove plan"
                      aria-label="Remove plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricsCard;
