import { CheckCircle2 } from 'lucide-react';
import type { TVPlanConfig } from '@/types/scheduling.types';
import type { TmdbEpisode, TmdbTVSeasonBrief } from '@/types/tmdb.types';

interface PlanModeSelectorProps {
  config: TVPlanConfig;
  onChange: (config: TVPlanConfig) => void;
  episodeCount: number;
  episodes: TmdbEpisode[];
  seasonNumber: number;
  hasAllSeasons: boolean;
  allSeasons?: TmdbTVSeasonBrief[];
}

export const PlanModeSelector = ({
  config,
  onChange,
  episodeCount,
  episodes,
  seasonNumber,
  hasAllSeasons,
  allSeasons,
}: PlanModeSelectorProps) => {
  const handleModeChange = (mode: 'daily' | 'deadline') => {
    onChange({
      ...config,
      mode,
    });
  };

  const getUpdatedEpisodeTimes = (pace: number, breakMins: number, currentTimes: string[]) => {
    const runtime = episodes[0]?.runtime || 45;
    const spacingMinutes = runtime + breakMins;
    const times = [...currentTimes];

    while (times.length < pace) {
      times.push('');
    }

    if (!times[0]) {
      times[0] = config.preferredTime || '20:00';
    }

    for (let i = 1; i < pace; i++) {
      const prevTime = times[i - 1] || '20:00';
      const [h, m] = prevTime.split(':').map(Number);
      const prevMinutes = (h ?? 20) * 60 + (m ?? 0);
      const newMinutesTotal = prevMinutes + spacingMinutes;
      const hour = Math.floor(newMinutesTotal / 60) % 24;
      const min = newMinutesTotal % 60;
      times[i] = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }

    return times.slice(0, pace);
  };

  const handleEpisodesPerDayChange = (val: number) => {
    const pace = Math.max(1, val);
    const breakMins = config.breakMinutes ?? 0;
    const currentTimes = config.episodeTimes || ['20:00'];
    const newTimes = getUpdatedEpisodeTimes(pace, breakMins, currentTimes);

    onChange({
      ...config,
      episodesPerDay: pace,
      episodeTimes: newTimes,
    });
  };

  const handleBreakMinutesChange = (val: number) => {
    const breakMins = Math.max(0, val);
    const currentTimes = config.episodeTimes || ['20:00'];
    const newTimes = getUpdatedEpisodeTimes(config.episodesPerDay, breakMins, currentTimes);

    onChange({
      ...config,
      breakMinutes: breakMins,
      episodeTimes: newTimes,
    });
  };

  const handleTemplateTimeChange = (idx: number, newTimeVal: string) => {
    const times = [...(config.episodeTimes || [])];
    times[idx] = newTimeVal;

    onChange({
      ...config,
      episodeTimes: times,
    });
  };

  const handleDeadlineChange = (val: string) => {
    onChange({
      ...config,
      deadlineDate: val,
    });
  };

  const handleStartDateChange = (val: string) => {
    onChange({
      ...config,
      startDate: val,
    });
  };

  const handleScopeChange = (scope: 'all' | 'season' | 'specific' | 'seasons') => {
    onChange({
      ...config,
      scope,
      selectedSeasons: scope === 'seasons' ? [seasonNumber] : [],
    });
  };

  const handleDaysOfWeekChange = (dayIndex: number) => {
    const activeDays = config.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6];
    const newDays = activeDays.includes(dayIndex)
      ? activeDays.filter(d => d !== dayIndex)
      : [...activeDays, dayIndex].sort();
    
    // Always keep at least one day selected
    if (newDays.length > 0) {
      onChange({
        ...config,
        daysOfWeek: newDays,
      });
    }
  };

  const DAYS_OF_WEEK = [
    { label: 'S', name: 'Sunday', index: 0 },
    { label: 'M', name: 'Monday', index: 1 },
    { label: 'T', name: 'Tuesday', index: 2 },
    { label: 'W', name: 'Wednesday', index: 3 },
    { label: 'T', name: 'Thursday', index: 4 },
    { label: 'F', name: 'Friday', index: 5 },
    { label: 'S', name: 'Saturday', index: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Plan Scope */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
          Plan Scope
        </label>
        <div className="grid grid-cols-2 gap-2">
          {hasAllSeasons && (
            <button
              type="button"
              onClick={() => handleScopeChange('all')}
              className={`py-2 px-3 rounded-xl border text-center transition-all text-xs font-bold ${
                config.scope === 'all'
                  ? 'bg-brand-primary/10 border-brand-primary text-white shadow-lg shadow-brand-primary/5'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
              }`}
            >
              All Seasons
            </button>
          )}
          {hasAllSeasons && (
            <button
              type="button"
              onClick={() => handleScopeChange('seasons')}
              className={`py-2 px-3 rounded-xl border text-center transition-all text-xs font-bold ${
                config.scope === 'seasons'
                  ? 'bg-brand-primary/10 border-brand-primary text-white shadow-lg shadow-brand-primary/5'
                  : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
              }`}
            >
              Select Seasons
            </button>
          )}
        </div>
      </div>

      {/* 1b. Select Seasons Checkboxes */}
      {config.scope === 'seasons' && allSeasons && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Choose Seasons to Schedule
          </label>
          <div className="flex flex-wrap gap-2 p-2.5 bg-white/3 border border-white/10 rounded-xl">
            {allSeasons.filter(s => s.season_number > 0).map(s => {
              const isChecked = config.selectedSeasons?.includes(s.season_number);
              return (
                <label key={s.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-white cursor-pointer hover:bg-white/10 transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const selected = config.selectedSeasons ?? [];
                      const newSelected = selected.includes(s.season_number)
                        ? selected.filter(n => n !== s.season_number)
                        : [...selected, s.season_number].sort((a,b) => a-b);
                      onChange({ ...config, selectedSeasons: newSelected });
                    }}
                    className="rounded border-white/10 text-brand-primary focus:ring-brand-primary bg-zinc-950 w-3.5 h-3.5"
                  />
                  <span>{s.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Mode Choice */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleModeChange('daily')}
          className={`p-4 rounded-xl border text-left transition-all relative ${
            config.mode === 'daily'
              ? 'bg-brand-primary/10 border-brand-primary text-white shadow-lg shadow-brand-primary/5'
              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
          }`}
        >
          {config.mode === 'daily' && (
            <CheckCircle2 className="w-4 h-4 text-brand-primary absolute top-3 right-3" />
          )}
          <h3 className="text-xs font-black uppercase tracking-wider mb-1">Daily Pace</h3>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Watch a set number of episodes per day.
          </p>
        </button>

        <button
          type="button"
          onClick={() => handleModeChange('deadline')}
          className={`p-4 rounded-xl border text-left transition-all relative ${
            config.mode === 'deadline'
              ? 'bg-brand-primary/10 border-brand-primary text-white shadow-lg shadow-brand-primary/5'
              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:text-white'
          }`}
        >
          {config.mode === 'deadline' && (
            <CheckCircle2 className="w-4 h-4 text-brand-primary absolute top-3 right-3" />
          )}
          <h3 className="text-xs font-black uppercase tracking-wider mb-1">Target Deadline</h3>
          <p className="text-[11px] leading-snug text-muted-foreground">
            Complete the season by a target calendar date.
          </p>
        </button>
      </div>

      {/* 4. Date & Pacing Settings in One Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Column 1: Start Date */}
        <div className="space-y-1">
          <label htmlFor="start-date" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Start Date
          </label>
          <input
            id="start-date"
            type="date"
            value={config.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
          />
        </div>

        {/* Column 2: Mode specific setting */}
        {config.mode === 'daily' ? (
          <div className="space-y-1">
            <label htmlFor="episodes-pace" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              Episodes Per Day
            </label>
            <input
              id="episodes-pace"
              type="number"
              min={1}
              max={10}
              value={config.episodesPerDay}
              onChange={(e) => handleEpisodesPerDayChange(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label htmlFor="target-deadline" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              Deadline Date
            </label>
            <input
              id="target-deadline"
              type="date"
              min={config.startDate}
              value={config.deadlineDate ?? ''}
              onChange={(e) => handleDeadlineChange(e.target.value)}
              className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
            />
          </div>
        )}

        {/* Column 3: Preferred Start Time */}
        <div className="space-y-1">
          <label htmlFor="pref-time" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Start Time
          </label>
          <input
            id="pref-time"
            type="time"
            value={config.preferredTime}
            onChange={(e) => {
              const baseTime = e.target.value;
              const currentTimes = config.episodeTimes || [];
              const newTimes = getUpdatedEpisodeTimes(config.episodesPerDay, config.breakMinutes ?? 0, [baseTime, ...currentTimes.slice(1)]);
              onChange({ ...config, preferredTime: baseTime, episodeTimes: newTimes });
            }}
            className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
          />
        </div>

        {/* Column 4: Break Time */}
        <div className="space-y-1">
          <label htmlFor="break-mins" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Break Time (mins)
          </label>
          <input
            id="break-mins"
            type="number"
            min={0}
            max={60}
            value={config.breakMinutes ?? 0}
            onChange={(e) => handleBreakMinutesChange(parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
          />
        </div>
      </div>

      {config.mode === 'daily' && (
        <span className="text-[10px] text-muted-foreground font-medium block">
          Takes about <span className="text-white font-bold">{Math.ceil(episodeCount / config.episodesPerDay)}</span> watch days.
        </span>
      )}

      {/* 5. Custom Episode Template list (Only for Daily Mode) */}
      {config.mode === 'daily' && (
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Episode Viewing Time Template
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-2 bg-white/3 border border-white/5 rounded-xl">
            {Array.from({ length: config.episodesPerDay }).map((_, idx) => {
              const timeVal = config.episodeTimes?.[idx] || '20:00';
              return (
                <div key={idx} className="space-y-1">
                  <label htmlFor={`ep-time-${idx}`} className="text-[8px] font-bold text-white/50 uppercase">
                    Ep {idx + 1}
                  </label>
                  <input
                    id={`ep-time-${idx}`}
                    type="time"
                    value={timeVal}
                    onChange={(e) => handleTemplateTimeChange(idx, e.target.value)}
                    className="w-full px-2 py-1 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white focus-visible:ring-1 focus-visible:ring-brand-primary/50"
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[9px] text-muted-foreground">
            Feel free to edit individual times above. Spacing is calculated automatically using your break time.
          </p>
        </div>
      )}

      {/* 6. Weekday Filter */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
          Watch Days
        </label>
        <div className="flex gap-2">
          {DAYS_OF_WEEK.map(day => {
            const activeDays = config.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6];
            const isSelected = activeDays.includes(day.index);
            return (
              <button
                key={day.index}
                type="button"
                onClick={() => handleDaysOfWeekChange(day.index)}
                title={day.name}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Select which days of the week you plan to watch episodes.
        </p>
      </div>
    </div>
  );
};
