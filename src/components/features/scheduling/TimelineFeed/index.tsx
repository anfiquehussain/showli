import { useState, useMemo } from 'react';
import { Film, Calendar, Search } from 'lucide-react';
import TimelineItem from './TimelineItem';
import type { ScheduleEntry, ScheduleStatus } from '@/types/scheduling.types';

interface TimelineFeedProps {
  schedules: ScheduleEntry[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showCompleted: boolean;
  onShowCompletedChange: (checked: boolean) => void;
  showSkipped: boolean;
  onShowSkippedChange: (checked: boolean) => void;
  onStatusChange: (id: string, status: ScheduleStatus) => void;
  onRescheduleClick: (schedule: ScheduleEntry) => void;
  onDeleteClick: (id: string) => void;
  selectedDate: Date;
}

export const TimelineFeed = ({
  schedules,
  isLoading,
  searchQuery,
  onSearchChange,
  showCompleted,
  onShowCompletedChange,
  showSkipped,
  onShowSkippedChange,
  onStatusChange,
  onRescheduleClick,
  onDeleteClick,
  selectedDate,
}: TimelineFeedProps) => {
  // Select buttons filter state: defaults to showing all items when no date is selected
  const [activeTab, setActiveTab] = useState<'movies' | 'tv' | 'all'>('all');

  // 1. FILTERING
  const filteredSchedules = useMemo(() => {
    const filterDate = selectedDate;

    return schedules.filter((item) => {
      // Search text filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesEpTitle = item.episodeTitle?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesEpTitle) return false;
      }

      // Tab selector filter (within the filtered day)
      if (activeTab === 'movies') {
        if (item.mediaType !== 'movie') return false;
      } else if (activeTab === 'tv') {
        if (item.mediaType !== 'episode') return false;
      }

      // Always filter by day (either selectedDate or Today)
      const itemDate = new Date(item.startAt);
      const isSameDay = itemDate.getDate() === filterDate.getDate() &&
                        itemDate.getMonth() === filterDate.getMonth() &&
                        itemDate.getFullYear() === filterDate.getFullYear();
      if (!isSameDay) return false;

      // Status filter
      if (item.status === 'completed' && !showCompleted) return false;
      if (item.status === 'skipped' && !showSkipped) return false;
      if (item.status === 'cancelled') return false;

      return true;
    });
  }, [schedules, searchQuery, showCompleted, showSkipped, selectedDate, activeTab]);

  // 2. CONFLICT CHECKS (Client-side overlap check)
  const conflictsMap = useMemo(() => {
    const map: Record<string, ScheduleEntry[]> = {};
    
    filteredSchedules.forEach((item) => {
      if (item.status !== 'scheduled') return;
      const overlaps = filteredSchedules.filter((other) => {
        if (other.id === item.id) return false;
        if (other.status !== 'scheduled') return false;
        return item.startAt < other.endAt && other.startAt < item.endAt;
      });
      if (overlaps.length > 0) {
        map[item.id] = overlaps;
      }
    });

    return map;
  }, [filteredSchedules]);

  // 3. GROUP BY DATE
  const dateGroups = useMemo(() => {
    const groups: { dateStr: string; label: string; epoch: number; items: ScheduleEntry[] }[] = [];
    const tempMap: Record<string, ScheduleEntry[]> = {};

    filteredSchedules.forEach((item) => {
      const d = new Date(item.startAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!tempMap[dateKey]) tempMap[dateKey] = [];
      tempMap[dateKey]!.push(item);
    });

    const sortedKeys = Object.keys(tempMap).sort();
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

    sortedKeys.forEach((key) => {
      const items = tempMap[key] || [];
      const sortedItems = items.sort((a, b) => a.startAt - b.startAt);
      const dateObj = new Date(key);
      
      let label = dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
      if (key === todayStr) {
        label = `Today — ${dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}`;
      } else if (key === tomorrowStr) {
        label = `Tomorrow — ${dateObj.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}`;
      }

      groups.push({
        dateStr: key,
        label: label.toUpperCase(),
        epoch: dateObj.getTime(),
        items: sortedItems,
      });
    });

    return groups;
  }, [filteredSchedules]);

  const handleTabChange = (tab: 'movies' | 'tv' | 'all') => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Inline Toolbar Navigator */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between pb-4 border-b border-white/5 select-none">
        
        {/* Select Buttons Group (All, Movies, TV Shows) */}
        <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 self-start md:self-auto shrink-0">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleTabChange('movies')}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'movies'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => handleTabChange('tv')}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'tv'
                ? 'bg-brand-primary text-white shadow-md'
                : 'text-muted-foreground hover:text-white hover:bg-white/5'
            }`}
          >
            TV Shows
          </button>
        </div>

        {/* Search & Status Controls */}
        <div className="flex flex-1 items-center gap-3 justify-end">
          {/* Search */}
          <div className="relative flex-1 max-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onShowCompletedChange(!showCompleted)}
              className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                showCompleted
                  ? 'bg-success/15 border-success/30 text-success'
                  : 'bg-white/3 border-white/5 text-muted-foreground hover:text-white'
              }`}
            >
              Watched
            </button>
            <button
              onClick={() => onShowSkippedChange(!showSkipped)}
              className={`px-2.5 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                showSkipped
                  ? 'bg-brand-secondary/15 border-brand-secondary/30 text-brand-secondary'
                  : 'bg-white/3 border-white/5 text-muted-foreground hover:text-white'
              }`}
            >
              Skipped
            </button>
          </div>
        </div>

      </div>

      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-32 bg-white/5 rounded-md" />
              <div className="h-24 bg-white/5 border border-white/10 rounded-2xl" />
            </div>
          ))}
        </div>
      ) : dateGroups.length === 0 ? (
        <div className="text-center py-20 bg-white/3 border border-white/5 rounded-3xl space-y-4 max-w-xl mx-auto">
          <Film className="w-14 h-14 text-muted-foreground/30 mx-auto" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white/70">Cozy Empty Timeline</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No schedules found for this filter. Head to Browse or check your watchlist to plan sessions!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {dateGroups.map((group) => (
            <div key={group.dateStr} className="space-y-3.5">
              {/* Day Sticky Header */}
              <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10 py-1.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-primary" aria-hidden="true" />
                <h3 className="text-xs font-heading font-black text-white tracking-wider">
                  {group.label}
                </h3>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Timeline list under day */}
              <div className="space-y-3">
                {group.items.map((schedule) => (
                  <TimelineItem
                    key={schedule.id}
                    schedule={schedule}
                    conflictingSchedules={conflictsMap[schedule.id] || []}
                    onStatusChange={onStatusChange}
                    onRescheduleClick={onRescheduleClick}
                    onDeleteClick={onDeleteClick}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimelineFeed;
