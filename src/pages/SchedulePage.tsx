import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, Film, Tv, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useScheduling } from '@/components/features/scheduling/hooks/useScheduling';
import ScheduleCalendar from '@/components/features/scheduling/ScheduleCalendar';
import { getTmdbImageUrl } from '@/utils/image';

type TabType = 'calendar' | 'movies' | 'tv';

export const SchedulePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch a broad range (next 6 months) for the dedicated Movies and TV Lists
  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const endRange = useMemo(() => {
    return startOfToday + 180 * 24 * 60 * 60 * 1000; // 6 months
  }, [startOfToday]);

  const { schedules, isLoading, updateStatus, deleteSchedule } = useScheduling({
    uid: user?.uid,
    startRange: startOfToday,
    endRange: endRange,
  });

  // Today date key in local time (YYYY-MM-DD)
  const todayDateKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Format time to 12-hour format
  const formatTime12 = (epochMs: number): string => {
    const d = new Date(epochMs);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Format date to readable string
  const formatDateReadable = (epochMs: number): string => {
    const d = new Date(epochMs);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Countdown function
  const getRemainingTimeText = (startAt: number, status: string) => {
    if (status !== 'scheduled') return status.toUpperCase();
    const diff = startAt - now;
    if (diff <= 0) return 'IN PROGRESS';
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `Starts in ${days}d ${hours % 24}h`;
    if (hours > 0) return `Starts in ${hours}h ${mins % 60}m`;
    return `Starts in ${mins}m`;
  };

  // 1. FILTER MOVIES
  const movieSchedules = useMemo(() => {
    return schedules
      .filter((s) => s.mediaType === 'movie')
      .sort((a, b) => a.startAt - b.startAt);
  }, [schedules]);

  // 2. FILTER & GROUP TV SHOW EPISODES
  const tvShowGroups = useMemo(() => {
    const groups: Record<number, {
      seriesId: number;
      title: string;
      posterPath: string | null;
      episodes: typeof schedules;
    }> = {};

    schedules.forEach((s) => {
      if (s.mediaType === 'episode' && s.parentSeriesId) {
        const seriesId = s.parentSeriesId;
        if (!groups[seriesId]) {
          groups[seriesId] = {
            seriesId,
            title: s.title,
            posterPath: s.posterPath,
            episodes: [],
          };
        }
        groups[seriesId]!.episodes.push(s);
      }
    });

    return Object.values(groups).map(g => {
      // Sort episodes by date
      const sorted = g.episodes.sort((a, b) => a.startAt - b.startAt);
      
      // Find next upcoming episode
      const nextEpisode = sorted.find(ep => ep.startAt > now && ep.status === 'scheduled') || null;
      
      // Calculate daily goal progress (episodes scheduled/completed today)
      const todayEpisodes = sorted.filter(ep => ep.localDateKey === todayDateKey);
      const todayCompleted = todayEpisodes.filter(ep => ep.status === 'completed').length;
      const todayTotal = todayEpisodes.length;

      // Extract episodes per day pace dynamically
      const datesMap: Record<string, number> = {};
      sorted.forEach(ep => {
        datesMap[ep.localDateKey] = (datesMap[ep.localDateKey] || 0) + 1;
      });
      const episodesPerDay = Math.max(...Object.values(datesMap), 1);

      // Extract active weekdays
      const weekDaysSet = new Set<number>();
      sorted.forEach(ep => {
        const d = new Date(ep.startAt);
        weekDaysSet.add(d.getDay());
      });
      const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const activeDaysList = Array.from(weekDaysSet).sort().map(day => DAYS_SHORT[day]).join(', ');

      // Plan range dates
      const startTimestamp = sorted.length > 0 ? sorted[0]?.startAt ?? null : null;
      const endTimestamp = sorted.length > 0 ? sorted[sorted.length - 1]?.startAt ?? null : null;

      // Overall Progress
      const overallCompleted = sorted.filter(ep => ep.status === 'completed').length;
      const overallTotal = sorted.length;

      return {
        ...g,
        episodes: sorted,
        nextEpisode,
        todayTotal,
        todayCompleted,
        episodesPerDay,
        activeDaysList,
        startTimestamp,
        endTimestamp,
        overallCompleted,
        overallTotal,
      };
    });
  }, [schedules, todayDateKey, now]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight leading-tight uppercase">
          Watch Planner
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg">
          Plan your watch sessions, schedule movies, track seasons, and avoid scheduling overlaps.
        </p>
      </div>

      {/* Tabs Controller */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 max-w-md">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'calendar'
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <CalendarIcon className="w-4 h-4" aria-hidden="true" />
          <span>Calendar</span>
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'movies'
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Film className="w-4 h-4" aria-hidden="true" />
          <span>Movies</span>
        </button>
        <button
          onClick={() => setActiveTab('tv')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tv'
              ? 'bg-brand-primary text-white shadow-lg'
              : 'text-muted-foreground hover:text-white hover:bg-white/5'
          }`}
        >
          <Tv className="w-4 h-4" aria-hidden="true" />
          <span>TV Shows</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="transition-all duration-300">
        {activeTab === 'calendar' && (
          <ScheduleCalendar />
        )}

        {/* ================= MOVIES TAB ================= */}
        {activeTab === 'movies' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-primary rounded-full" />
                Scheduled Movies List
              </h2>
              <span className="text-xs text-muted-foreground font-bold">
                {movieSchedules.length} Movies Plan
              </span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl" />
                ))}
              </div>
            ) : movieSchedules.length === 0 ? (
              <div className="text-center py-16 bg-white/3 border border-white/5 rounded-3xl">
                <Film className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-bold text-white/50">No movies scheduled yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Visit any movie page and click Schedule to plan a watch session!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movieSchedules.map((item) => {
                  const remainingText = getRemainingTimeText(item.startAt, item.status);
                  const isCompleted = item.status === 'completed';

                  return (
                    <div
                      key={item.id}
                      className="group flex gap-4 p-3 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl transition-all relative overflow-hidden"
                    >
                      {/* Poster */}
                      <div className="w-16 sm:w-20 aspect-2/3 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-zinc-950">
                        {item.posterPath ? (
                          <img
                            src={getTmdbImageUrl(item.posterPath, 'w185')}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">No Poster</div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div className="space-y-1">
                          <h3 className="text-sm sm:text-base font-bold text-white truncate group-hover:text-brand-primary transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{formatDateReadable(item.startAt)} at {formatTime12(item.startAt)}</span>
                          </div>
                        </div>

                        {/* Status details & Countdown */}
                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            isCompleted
                              ? 'bg-success/10 border-success/20 text-success'
                              : item.status === 'cancelled'
                                ? 'bg-error/10 border-error/20 text-error'
                                : 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                          }`}>
                            {remainingText}
                          </span>
                          
                          {/* Quick Status toggle */}
                          {item.status === 'scheduled' && (
                            <button
                              onClick={() => updateStatus(item.id, 'completed')}
                              className="text-[10px] font-bold text-muted-foreground hover:text-success flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Mark Watched</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Delete Trigger */}
                      <button
                        onClick={() => deleteSchedule(item.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-error/10 text-muted-foreground hover:text-error transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        title="Remove Schedule"
                        aria-label="Remove Schedule"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TV SHOWS TAB ================= */}
        {activeTab === 'tv' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-1 h-4 bg-brand-primary rounded-full" />
                Active TV Watch Plans
              </h2>
              <span className="text-xs text-muted-foreground font-bold">
                {tvShowGroups.length} Shows Tracked
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-40 bg-white/5 border border-white/10 rounded-2xl" />
                ))}
              </div>
            ) : tvShowGroups.length === 0 ? (
              <div className="text-center py-16 bg-white/3 border border-white/5 rounded-3xl">
                <Tv className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" aria-hidden="true" />
                <p className="text-sm font-bold text-white/50">No TV show schedule plans yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Go to any show page, select a season and click Schedule Season to generate a pace plan!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tvShowGroups.map((group) => {
                  const hasGoalToday = group.todayTotal > 0;
                  const progressPct = hasGoalToday ? Math.round((group.todayCompleted / group.todayTotal) * 100) : 0;

                  return (
                    <div
                      key={group.seriesId}
                      className="group flex flex-col md:flex-row gap-5 p-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-3xl transition-all"
                    >
                      {/* Show Poster & Header info */}
                      <div className="flex gap-4 shrink-0 md:w-64">
                        <div className="w-16 sm:w-20 md:w-24 aspect-2/3 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-zinc-950 shadow-md">
                          {group.posterPath ? (
                            <img
                              src={getTmdbImageUrl(group.posterPath, 'w185')}
                              alt={group.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">No Poster</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div className="space-y-1">
                            <h3 className="text-base font-bold text-white truncate group-hover:text-brand-primary transition-colors">
                              {group.title}
                            </h3>
                            <span className="text-[10px] font-black text-brand-secondary uppercase bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/20 shrink-0">
                              {group.episodes.length} EPISODES
                            </span>
                          </div>

                          {/* Plan Details Info */}
                          <div className="text-[10px] text-muted-foreground font-semibold space-y-1.5 my-2 pb-2 border-b border-white/5">
                            <div className="flex justify-between">
                              <span>Daily Pace:</span>
                              <span className="text-white font-bold">{group.episodesPerDay} ep / day</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Watch Days:</span>
                              <span className="text-white font-bold truncate max-w-[120px]">{group.activeDaysList}</span>
                            </div>
                            {group.startTimestamp && group.endTimestamp && (
                              <div className="flex justify-between">
                                <span>Timeline:</span>
                                <span className="text-white font-bold truncate max-w-[120px]">
                                  {formatDateReadable(group.startTimestamp)} - {formatDateReadable(group.endTimestamp)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Daily goal progress */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                              <span>TODAY'S PACE</span>
                              <span className="text-white">{group.todayCompleted}/{group.todayTotal} watched</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                              <div
                                className="h-full bg-brand-primary transition-all duration-500"
                                style={{ width: `${hasGoalToday ? progressPct : 0}%` }}
                              />
                            </div>
                          </div>

                          {/* Overall plan completion progress */}
                          <div className="space-y-1 pt-2 border-t border-white/5 mt-2">
                            <div className="flex justify-between text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                              <span>Plan Completion</span>
                              <span className="text-brand-primary">{Math.round((group.overallCompleted / group.overallTotal) * 100)}%</span>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-secondary transition-all duration-500"
                                style={{ width: `${Math.round((group.overallCompleted / group.overallTotal) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Divider for larger screens */}
                      <div className="hidden md:block w-px bg-white/10" />

                      {/* Next episode info & countdown */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                        {group.nextEpisode ? (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                                UPCOMING SESSION
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20 shrink-0">
                                  S{group.nextEpisode.seasonNumber}E{group.nextEpisode.episodeNumber}
                                </span>
                                <h4 className="text-sm font-bold text-white truncate">
                                  {group.nextEpisode.episodeTitle}
                                </h4>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground font-semibold">
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                                <span>{formatDateReadable(group.nextEpisode.startAt)} at {formatTime12(group.nextEpisode.startAt)}</span>
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-wider text-brand-secondary bg-brand-secondary/5 border border-brand-secondary/20 px-2 py-0.5 rounded">
                                {getRemainingTimeText(group.nextEpisode.startAt, group.nextEpisode.status)}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col justify-center items-center h-full text-center py-4">
                            <CheckCircle2 className="w-8 h-8 text-success/60 mb-2" aria-hidden="true" />
                            <p className="text-xs font-bold text-white/60">All scheduled episodes completed!</p>
                          </div>
                        )}

                        {/* Link to details or action */}
                        {group.nextEpisode && (
                          <div className="flex items-center gap-3 pt-3">
                            <button
                              onClick={() => updateStatus(group.nextEpisode!.id, 'completed')}
                              className="text-[10px] font-bold text-success hover:bg-success/10 border border-success/20 px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Mark Watched</span>
                            </button>
                            <button
                              onClick={() => updateStatus(group.nextEpisode!.id, 'skipped')}
                              className="text-[10px] font-bold text-muted-foreground hover:text-white hover:bg-white/5 border border-white/10 px-3 py-1 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Skip</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
