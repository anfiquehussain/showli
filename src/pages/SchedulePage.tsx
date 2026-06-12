import { useState, useMemo, useEffect } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useScheduling } from '@/components/features/scheduling/hooks/useScheduling';
import ScheduleSidebar from '@/components/features/scheduling/ScheduleSidebar';
import TimelineFeed from '@/components/features/scheduling/TimelineFeed';
import UpNextCard from '@/components/features/scheduling/ScheduleSidebar/UpNextCard';
import MetricsCard from '@/components/features/scheduling/ScheduleSidebar/MetricsCard';
import RescheduleDrawer from '@/components/features/scheduling/RescheduleDrawer';
import type { ScheduleEntry } from '@/types/scheduling.types';

export const SchedulePage = () => {
  const { user } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  // Search, Filters & Selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
  // Drawer/Modal States
  const [rescheduleItem, setRescheduleItem] = useState<ScheduleEntry | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // Fetch up to 6 months in advance
  const endRange = useMemo(() => {
    return startOfToday + 180 * 24 * 60 * 60 * 1000;
  }, [startOfToday]);

  const {
    schedules,
    isLoading,
    updateStatus,
    updateSchedule,
    deleteSchedule,
    deletePlan,
  } = useScheduling({
    uid: user?.uid,
    startRange: startOfToday - 7 * 24 * 60 * 60 * 1000, // Show past week too for history/completed checks
    endRange: endRange,
  });

  const todayDateKey = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Compute Next watch session (immediate upcoming item)
  const nextItem = useMemo(() => {
    const upcoming = schedules
      .filter((s) => s.status === 'scheduled')
      .sort((a, b) => a.startAt - b.startAt);
    return upcoming[0] || null;
  }, [schedules]);

  // Compute total completed items
  const totalCompletedCount = useMemo(() => {
    return schedules.filter((s) => s.status === 'completed').length;
  }, [schedules]);

  // Group TV shows for progress tracking in sidebar
  const tvShowGroups = useMemo(() => {
    const groups: Record<number, {
      seriesId: number;
      title: string;
      posterPath: string | null;
      episodes: ScheduleEntry[];
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

    return Object.values(groups).map((g) => {
      const sorted = g.episodes.sort((a, b) => a.startAt - b.startAt);
      const nextEpisode = sorted.find((ep) => ep.startAt > now && ep.status === 'scheduled') || null;

      const todayEpisodes = sorted.filter((ep) => ep.localDateKey === todayDateKey);
      const todayCompleted = todayEpisodes.filter((ep) => ep.status === 'completed').length;
      const todayTotal = todayEpisodes.length;

      const datesMap: Record<string, number> = {};
      sorted.forEach((ep) => {
        datesMap[ep.localDateKey] = (datesMap[ep.localDateKey] || 0) + 1;
      });
      const episodesPerDay = Math.max(...Object.values(datesMap), 1);

      const weekDaysSet = new Set<number>();
      sorted.forEach((ep) => {
        const d = new Date(ep.startAt);
        weekDaysSet.add(d.getDay());
      });
      const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const activeDaysList = Array.from(weekDaysSet)
        .sort()
        .map((day) => DAYS_SHORT[day])
        .join(', ');

      const startTimestamp = sorted.length > 0 ? sorted[0]?.startAt ?? null : null;
      const endTimestamp = sorted.length > 0 ? sorted[sorted.length - 1]?.startAt ?? null : null;

      const overallCompleted = sorted.filter((ep) => ep.status === 'completed').length;
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

  const handleSnooze = async (id: string, currentStart: number) => {
    await updateSchedule(id, { startAt: currentStart + 15 * 60 * 1000 });
  };

  const handleRescheduleConfirm = async (id: string, startAt: number) => {
    return await updateSchedule(id, { startAt });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight leading-tight uppercase">
            Watch Planner
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-lg">
            Manage your schedule, resolve media conflicts, and track active TV series progress in real-time.
          </p>
        </div>
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Pane: Filters & Mini Calendar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6">
            <ScheduleSidebar
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onClearDate={() => setSelectedDate(new Date())}
              schedules={schedules}
              now={now}
            />
          </div>
        </div>

        {/* Middle Pane: Chronological Feed */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-brand-primary rounded-full" />
              Schedules Timeline
            </h2>
          </div>

          <TimelineFeed
            schedules={schedules}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            showCompleted={showCompleted}
            onShowCompletedChange={setShowCompleted}
            showSkipped={showSkipped}
            onShowSkippedChange={setShowSkipped}
            onStatusChange={updateStatus}
            onRescheduleClick={setRescheduleItem}
            onDeleteClick={deleteSchedule}
            selectedDate={selectedDate}
          />
        </div>

        {/* Right Pane: Up Next & Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <div className="sticky top-6 space-y-6">
            <div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2">
                Up Next
              </span>
              <UpNextCard
                nextItem={nextItem}
                onStatusChange={updateStatus}
                onSnooze={handleSnooze}
              />
            </div>

            <div>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block mb-2">
                Overview & Metrics
              </span>
              <MetricsCard
                tvShowGroups={tvShowGroups}
                totalCompletedCount={totalCompletedCount}
                onDeletePlan={deletePlan}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Reschedule Drawer Panel */}
      <RescheduleDrawer
        key={rescheduleItem?.id ?? 'none'}
        isOpen={rescheduleItem !== null}
        onClose={() => setRescheduleItem(null)}
        schedule={rescheduleItem}
        onConfirm={handleRescheduleConfirm}
      />
    </div>
  );
};

export default SchedulePage;
