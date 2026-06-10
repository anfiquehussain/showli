/**
 * Scheduling System Type Definitions
 *
 * Types for the media scheduling feature — scheduling movies and
 * TV show episodes with duration-aware conflict detection.
 */

// --- Core Schedule Types ---

export type ScheduleStatus = 'scheduled' | 'completed' | 'skipped' | 'cancelled';

export interface ScheduleEntry {
  id: string;
  mediaType: 'movie' | 'tv' | 'episode' | 'other';
  sourceType: 'manual' | 'auto_plan';
  tmdbId: number;
  parentSeriesId: number | null;
  seasonNumber: number | null;
  episodeNumber: number | null;
  episodeTitle: string | null;
  title: string;
  posterPath: string | null;
  durationMinutes: number;
  startAt: number;               // Epoch milliseconds
  endAt: number;                 // Epoch milliseconds (startAt + durationMinutes)
  timezone: string;
  localDateKey: string;          // YYYY-MM-DD
  status: ScheduleStatus;
  notes: string | null;
  planId: string | null;
  createdAt: number;
  updatedAt: number;
}

// --- Form & Input Types ---

export interface ScheduleFormData {
  mediaType: 'movie' | 'tv' | 'episode' | 'other';
  sourceType: 'manual' | 'auto_plan';
  tmdbId: number;
  parentSeriesId?: number | null;
  seasonNumber?: number | null;
  episodeNumber?: number | null;
  episodeTitle?: string | null;
  title: string;
  posterPath: string | null;
  durationMinutes: number;
  startAt: number;
  notes?: string;
  planId?: string | null;
}

export interface ScheduleConflict {
  entry: ScheduleEntry;
  overlapStart: number;
  overlapEnd: number;
}

// --- TV Plan Types ---

export type TVPlanMode = 'daily' | 'deadline';

export interface TVPlanConfig {
  mode: TVPlanMode;
  startDate: string;             // ISO date string (YYYY-MM-DD)
  preferredTime: string;         // HH:mm format
  episodesPerDay: number;        // For 'daily' mode
  deadlineDate?: string | null;  // ISO date string for 'deadline' mode
  daysOfWeek: number[];          // Selected days of week (0-6)
  episodeTimes?: string[];       // Specific times per episode of the day (e.g. ['20:00', '21:00'])
  scope: 'all' | 'season' | 'specific' | 'seasons';
  selectedEpisodes?: number[];   // List of episode numbers selected when scope is 'specific'
  selectedSeasons?: number[];    // List of season numbers selected when scope is 'seasons'
  breakMinutes?: number;         // Optional break time in minutes between episodes
}

export interface TVPlanEpisode {
  episodeNumber: number;
  episodeTitle: string;
  runtimeMinutes: number | null;
}

export interface PreviewScheduleEntry {
  entry: ScheduleFormData;
  conflicts: ScheduleConflict[];
}

export interface SchedulePlan {
  id: string;
  seriesId: number;
  planType: 'daily_goal' | 'finish_by_date';
  episodesPerDay: number;
  targetEndDate: string | null;  // ISO date string
  preferredTimeOfDay: string;    // HH:mm
  timezone: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
}

// --- Constants ---

export const DEFAULT_MOVIE_RUNTIME = 120;
export const DEFAULT_EPISODE_RUNTIME = 45;
export const SCHEDULE_STATUSES: { value: ScheduleStatus; label: string }[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'skipped', label: 'Skipped' },
  { value: 'cancelled', label: 'Cancelled' },
];
