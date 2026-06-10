import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { schedulingService } from '@/api/scheduling/schedulingService';
import { TMDB_BASE_URL, TMDB_API_KEY } from '@/api/base';

import type { TVPlanConfig, ScheduleFormData, PreviewScheduleEntry } from '@/types/scheduling.types';
import { DEFAULT_EPISODE_RUNTIME } from '@/types/scheduling.types';
import type { TmdbEpisode, TmdbTVSeasonBrief } from '@/types/tmdb.types';

import { PlanModeSelector } from './PlanModeSelector';
import { PlanPreview } from './PlanPreview';
import { useScheduling } from '../hooks/useScheduling';

interface TVSchedulePlannerProps {
  isOpen: boolean;
  onClose: () => void;
  tvId: number;
  seasonNumber: number;
  episodes: TmdbEpisode[];
  showTitle: string;
  posterPath: string | null;
  allSeasons?: TmdbTVSeasonBrief[];
}

export const TVSchedulePlanner = ({
  isOpen,
  onClose,
  tvId,
  seasonNumber,
  episodes,
  showTitle,
  posterPath,
  allSeasons,
}: TVSchedulePlannerProps) => {
  const { user, openModal: openAuthModal } = useAuth();
  const { createBatchSchedule } = useScheduling({ uid: user?.uid });

  const todayStr = new Date().toISOString().split('T')[0] || '';

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [config, setConfig] = useState<TVPlanConfig>({
    mode: 'daily',
    startDate: todayStr,
    preferredTime: '20:00',
    episodesPerDay: 1,
    daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri default
    scope: 'seasons',
    episodeTimes: ['20:00'],
    selectedEpisodes: [],
    selectedSeasons: [seasonNumber],
    breakMinutes: 0,
  });

  const [previewEntries, setPreviewEntries] = useState<PreviewScheduleEntry[]>([]);
  const [localEpisodes, setLocalEpisodes] = useState<TmdbEpisode[]>(() => episodes);

  // Fetch episodes dynamically if selected season changes or if opened from hero
  useEffect(() => {
    const fetchEpisodesForSeason = async () => {
      const activeSeason = config.selectedSeasons?.[0] || seasonNumber;
      try {
        const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${activeSeason}?api_key=${TMDB_API_KEY}`);
        if (res.ok) {
          const data = await res.json();
          if (data.episodes) {
            setLocalEpisodes(data.episodes);
            setConfig(prev => ({
              ...prev,
              selectedEpisodes: data.episodes.map((e: TmdbEpisode) => e.episode_number)
            }));
          }
        }
      } catch {
        // Ignore
      }
    };

    if (isOpen) {
      fetchEpisodesForSeason();
    }
  }, [tvId, seasonNumber, config.selectedSeasons, isOpen]);

  // Compute total episodes count based on selected scope
  const episodeCount = useMemo(() => {
    if (config.scope === 'all' && allSeasons) {
      return allSeasons.reduce((sum, s) => sum + (s.season_number > 0 ? s.episode_count : 0), 0);
    }
    if (config.scope === 'seasons' && allSeasons) {
      const selectedNums = config.selectedSeasons ?? [];
      return allSeasons.reduce((sum, s) => sum + (selectedNums.includes(s.season_number) ? s.episode_count : 0), 0);
    }
    if (config.scope === 'specific') {
      return config.selectedEpisodes?.length ?? 0;
    }
    return localEpisodes.length;
  }, [config.scope, config.selectedEpisodes, config.selectedSeasons, localEpisodes, allSeasons]);

  // Calculate batch plan entries based on mode and configuration
  const generatePreview = useCallback(async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      let episodesToSchedule: { episodeNumber: number; seasonNumber: number; episodeTitle: string; runtimeMinutes: number }[] = [];

      // 1. Fetch episodes based on scope selection
      if (config.scope === 'all' && allSeasons) {
        const activeSeasons = allSeasons.filter(s => s.season_number > 0).sort((a,b) => a.season_number - b.season_number);
        const allEpisodesList: typeof episodesToSchedule = [];

        for (const s of activeSeasons) {
          const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${s.season_number}?api_key=${TMDB_API_KEY}`);
          if (res.ok) {
            const data = await res.json();
            if (data.episodes) {
              const sortedEpisodes = [...data.episodes].sort((a,b) => a.episode_number - b.episode_number);
              sortedEpisodes.forEach((ep: TmdbEpisode) => {
                allEpisodesList.push({
                  episodeNumber: ep.episode_number,
                  seasonNumber: s.season_number,
                  episodeTitle: `${s.name} - Ep ${ep.episode_number}: ${ep.name}`,
                  runtimeMinutes: ep.runtime ?? DEFAULT_EPISODE_RUNTIME,
                });
              });
            }
          }
        }
        episodesToSchedule = allEpisodesList;
      } else if (config.scope === 'seasons' && allSeasons) {
        const selectedNums = config.selectedSeasons ?? [];
        const activeSeasons = allSeasons.filter(s => selectedNums.includes(s.season_number)).sort((a,b) => a.season_number - b.season_number);
        const allEpisodesList: typeof episodesToSchedule = [];

        for (const s of activeSeasons) {
          const res = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${s.season_number}?api_key=${TMDB_API_KEY}`);
          if (res.ok) {
            const data = await res.json();
            if (data.episodes) {
              const sortedEpisodes = [...data.episodes].sort((a,b) => a.episode_number - b.episode_number);
              sortedEpisodes.forEach((ep: TmdbEpisode) => {
                allEpisodesList.push({
                  episodeNumber: ep.episode_number,
                  seasonNumber: s.season_number,
                  episodeTitle: `${s.name} - Ep ${ep.episode_number}: ${ep.name}`,
                  runtimeMinutes: ep.runtime ?? DEFAULT_EPISODE_RUNTIME,
                });
              });
            }
          }
        }
        episodesToSchedule = allEpisodesList;
      } else {
        let baseList = localEpisodes.map(ep => ({
          episodeNumber: ep.episode_number,
          seasonNumber: config.selectedSeasons?.[0] || seasonNumber,
          episodeTitle: ep.name,
          runtimeMinutes: ep.runtime ?? DEFAULT_EPISODE_RUNTIME,
        })).sort((a,b) => a.episodeNumber - b.episodeNumber);

        if (config.scope === 'specific') {
          const selectedNums = config.selectedEpisodes ?? [];
          baseList = baseList.filter(ep => selectedNums.includes(ep.episodeNumber));
        }
        episodesToSchedule = baseList;
      }

      const currentDay = new Date(config.startDate);
      const generated: ScheduleFormData[] = [];
      const activeDays = config.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6];

      if (config.mode === 'daily') {
        let epIndex = 0;
        while (epIndex < episodesToSchedule.length) {
          // Advance currentDay until it lands on an active watch day
          while (!activeDays.includes(currentDay.getDay())) {
            currentDay.setDate(currentDay.getDate() + 1);
          }

          const dailyPace = config.episodesPerDay;
          const limit = Math.min(epIndex + dailyPace, episodesToSchedule.length);
          let lastEndTime: number | null = null;

          for (let i = epIndex; i < limit; i++) {
            const ep = episodesToSchedule[i];
            if (!ep) continue;

            const daySlotIdx = i - epIndex;
            const timeStr = config.episodeTimes?.[daySlotIdx] || config.preferredTime || '20:00';
            const [hours, minutes] = timeStr.split(':').map(Number);

            let start = new Date(
              currentDay.getFullYear(),
              currentDay.getMonth(),
              currentDay.getDate(),
              hours ?? 20,
              minutes ?? 0
            ).getTime();

            // Adaptive time: if this episode overlaps with the previous one scheduled today, start immediately after it ends
            if (lastEndTime !== null && start < lastEndTime) {
              start = lastEndTime;
            }

            generated.push({
              tmdbId: tvId,
              mediaType: 'episode',
              sourceType: 'auto_plan',
              parentSeriesId: tvId,
              seasonNumber: ep.seasonNumber,
              episodeNumber: ep.episodeNumber,
              episodeTitle: ep.episodeTitle,
              title: showTitle,
              posterPath: posterPath,
              startAt: start,
              durationMinutes: ep.runtimeMinutes,
            });

            lastEndTime = start + ep.runtimeMinutes * 60 * 1000 + (config.breakMinutes || 0) * 60 * 1000;
          }

          epIndex = limit;
          currentDay.setDate(currentDay.getDate() + 1); // Move to next day for next batch
        }
      } else {
        // Deadline mode
        const timeStr = config.episodeTimes?.[0] || config.preferredTime || '20:00';
        const deadlineDate = config.deadlineDate ? new Date(config.deadlineDate) : currentDay;

        // Find all available watch days in the range
        const watchDates: Date[] = [];
        const tempDay = new Date(currentDay);
        while (tempDay <= deadlineDate) {
          if (activeDays.includes(tempDay.getDay())) {
            watchDates.push(new Date(tempDay));
          }
          tempDay.setDate(tempDay.getDate() + 1);
        }

        if (watchDates.length === 0) {
          watchDates.push(new Date(currentDay));
        }

        // Distribute episodes as evenly as possible across the watch dates
        const totalDays = watchDates.length;
        const epsPerDayRaw = episodesToSchedule.length / totalDays;
        let epIndex = 0;

        for (let dayIdx = 0; dayIdx < totalDays && epIndex < episodesToSchedule.length; dayIdx++) {
          const targetDay = watchDates[dayIdx];
          if (!targetDay) continue;
          
          // Calculate number of episodes for this day
          const dayLimit = dayIdx === totalDays - 1
            ? episodesToSchedule.length - epIndex
            : Math.round(epsPerDayRaw * (dayIdx + 1)) - epIndex;

          let lastEndTime: number | null = null;

          for (let i = 0; i < dayLimit; i++) {
            const ep = episodesToSchedule[epIndex + i];
            if (!ep) continue;

            const timeStrForSlot = config.episodeTimes?.[i] || timeStr;
            const [h, m] = timeStrForSlot.split(':').map(Number);

            let start = new Date(
              targetDay.getFullYear(),
              targetDay.getMonth(),
              targetDay.getDate(),
              h ?? 20,
              m ?? 0
            ).getTime();

            // Adaptive time: if this episode overlaps with the previous one scheduled today, start immediately after it ends
            if (lastEndTime !== null && start < lastEndTime) {
              start = lastEndTime;
            }

            generated.push({
              tmdbId: tvId,
              mediaType: 'episode',
              sourceType: 'auto_plan',
              parentSeriesId: tvId,
              seasonNumber: ep.seasonNumber,
              episodeNumber: ep.episodeNumber,
              episodeTitle: ep.episodeTitle,
              title: showTitle,
              posterPath: posterPath,
              startAt: start,
              durationMinutes: ep.runtimeMinutes,
            });

            lastEndTime = start + ep.runtimeMinutes * 60 * 1000 + (config.breakMinutes || 0) * 60 * 1000;
          }
          epIndex += dayLimit;
        }
      }

      // Perform conflict check for each preview entry
      const checkedEntries: PreviewScheduleEntry[] = await Promise.all(
        generated.map(async (entry) => {
          const endTime = entry.startAt + entry.durationMinutes * 60 * 1000;
          const conflicts = await schedulingService.checkConflicts(user.uid, entry.startAt, endTime);
          return {
            entry,
            conflicts,
          };
        })
      );
      setPreviewEntries(checkedEntries);
    } catch {
      // Fallback: empty conflicts
      setPreviewEntries([]);
    } finally {
      setIsSubmitting(false);
    }
  }, [user, config, tvId, seasonNumber, showTitle, posterPath, allSeasons, localEpisodes]);

  // Handle preview generation when switching to step 2
  const handleNext = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    await generatePreview();
    setStep(2);
  };

  const adjustSubsequentEntries = async (entries: PreviewScheduleEntry[], startIndex: number) => {
    if (!user) return entries;
    const list = [...entries];
    
    for (let i = startIndex; i < list.length; i++) {
      const current = list[i];
      if (!current) continue;

      if (i > 0) {
        const prev = list[i - 1];
        if (prev) {
          const prevDate = new Date(prev.entry.startAt);
          const currDate = new Date(current.entry.startAt);
          const isSameDay = prevDate.getFullYear() === currDate.getFullYear() &&
                            prevDate.getMonth() === currDate.getMonth() &&
                            prevDate.getDate() === currDate.getDate();

          if (isSameDay) {
            const prevEndTimeWithBreak = prev.entry.startAt + 
              prev.entry.durationMinutes * 60 * 1000 + 
              (config.breakMinutes || 0) * 60 * 1000;

            if (current.entry.startAt < prevEndTimeWithBreak) {
              current.entry.startAt = prevEndTimeWithBreak;
            }
          }
        }
      }

      // Recheck conflicts
      const duration = current.entry.durationMinutes * 60 * 1000;
      current.conflicts = await schedulingService.checkConflicts(user.uid, current.entry.startAt, current.entry.startAt + duration);
    }
    return list;
  };

  const handleTimeChange = async (index: number, newTimeStr: string) => {
    const entries = [...previewEntries];
    const preview = entries[index];
    if (!preview) return;
    const d = new Date(preview.entry.startAt);
    const [h, m] = newTimeStr.split(':').map(Number);
    d.setHours(h ?? 20, m ?? 0);

    const newStart = d.getTime();

    setIsSubmitting(true);
    try {
      entries[index] = {
        ...preview,
        entry: {
          ...preview.entry,
          startAt: newStart,
        },
      };

      const updated = await adjustSubsequentEntries(entries, index);
      setPreviewEntries(updated);
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = async (index: number, newDateStr: string) => {
    const entries = [...previewEntries];
    const preview = entries[index];
    if (!preview) return;
    const d = new Date(preview.entry.startAt);
    const parts = newDateStr.split('-').map(Number);
    const y = parts[0] ?? d.getFullYear();
    const mon = parts[1] ?? (d.getMonth() + 1);
    const day = parts[2] ?? d.getDate();
    const dateObj = new Date(y, mon - 1, day, d.getHours(), d.getMinutes());

    const newStart = dateObj.getTime();

    setIsSubmitting(true);
    try {
      entries[index] = {
        ...preview,
        entry: {
          ...preview.entry,
          startAt: newStart,
        },
      };

      const updated = await adjustSubsequentEntries(entries, index);
      setPreviewEntries(updated);
    } catch {
      // Ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePlan = async () => {
    if (!user || previewEntries.length === 0) return;
    setIsSubmitting(true);

    const planId = `plan_${tvId}_S${seasonNumber}_${Date.now()}`;
    const rawData = previewEntries.map(p => p.entry);

    try {
      // Save plan metadata
      await schedulingService.savePlanMetadata(
        user.uid,
        planId,
        tvId,
        config.mode === 'daily' ? 'daily_goal' : 'finish_by_date',
        config.episodesPerDay,
        config.mode === 'deadline' ? config.deadlineDate ?? null : null,
        config.episodeTimes?.join(',') || config.preferredTime
      );

      // Create scheduled items
      const created = await createBatchSchedule(rawData, planId);
      setIsSubmitting(false);
      if (created.length > 0) {
        onClose();
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const totalConflicts = useMemo(() => {
    return previewEntries.reduce((sum, p) => sum + p.conflicts.length, 0);
  }, [previewEntries]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-zinc-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
            <div>
              <h2 className="text-base font-bold text-white">Season Schedule Planner</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                {showTitle} {config.scope === 'season' && `· Season ${seasonNumber}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-5 overflow-y-auto space-y-5 custom-scrollbar flex-1">
            {step === 1 ? (
              <PlanModeSelector
                config={config}
                onChange={setConfig}
                episodeCount={episodeCount}
                episodes={localEpisodes}
                seasonNumber={config.selectedSeasons?.[0] || seasonNumber}
                hasAllSeasons={Boolean(allSeasons && allSeasons.length > 0)}
                allSeasons={allSeasons}
              />
            ) : (
              <PlanPreview
                config={config}
                previewEntries={previewEntries}
                onTimeChange={handleTimeChange}
                onDateChange={handleDateChange}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 shrink-0">
            {step === 1 ? (
              <>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 py-2"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={isSubmitting || episodeCount === 0}
                  className="flex-1 py-2"
                >
                  {isSubmitting ? 'Calculating...' : 'Preview Schedule'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                  className="flex-1 py-2"
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSavePlan}
                  disabled={totalConflicts > 0 || isSubmitting}
                  className="flex-1 py-2"
                >
                  {isSubmitting ? 'Saving Plan...' : 'Confirm Plan'}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TVSchedulePlanner;
