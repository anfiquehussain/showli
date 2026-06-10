import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type {
  ScheduleEntry,
  ScheduleFormData,
  ScheduleConflict,
  ScheduleStatus,
} from '@/types/scheduling.types';
import { DEFAULT_MOVIE_RUNTIME, DEFAULT_EPISODE_RUNTIME } from '@/types/scheduling.types';

const USERS_COLLECTION = 'users';
const ITEMS_COLLECTION = 'schedule_items';

/**
 * Calculate end time from start time and duration
 */
const calculateEndTime = (startAt: number, durationMinutes: number | null, mediaType: 'movie' | 'tv' | 'episode' | 'other'): number => {
  const fallback = mediaType === 'movie' ? DEFAULT_MOVIE_RUNTIME : DEFAULT_EPISODE_RUNTIME;
  const duration = (durationMinutes ?? fallback) * 60 * 1000;
  return startAt + duration;
};

/**
 * Helper to compute local YYYY-MM-DD key for a timestamp
 */
const getLocalDateKey = (epochMs: number): string => {
  const d = new Date(epochMs);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/**
 * Helper to get local timezone
 */
const getTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
};

export const schedulingService = {
  // =========================================================================
  // QUERIES
  // =========================================================================

  /**
   * Get all schedules for a user within a date range
   */
  getSchedules: async (
    uid: string,
    startRange: number,
    endRange: number
  ): Promise<ScheduleEntry[]> => {
    const schedulesRef = collection(db, USERS_COLLECTION, uid, ITEMS_COLLECTION);
    const q = query(
      schedulesRef,
      where('startAt', '>=', startRange),
      where('startAt', '<=', endRange),
      orderBy('startAt', 'asc')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as ScheduleEntry));
  },

  /**
   * Get a single schedule entry by ID
   */
  getScheduleById: async (uid: string, scheduleId: string): Promise<ScheduleEntry | null> => {
    const docRef = doc(db, USERS_COLLECTION, uid, ITEMS_COLLECTION, scheduleId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as ScheduleEntry;
  },

  // =========================================================================
  // CONFLICT DETECTION
  // =========================================================================

  /**
   * Check for scheduling conflicts in a given time range.
   * Uses the overlap formula: existingStart < newEnd AND newStart < existingEnd
   */
  checkConflicts: async (
    uid: string,
    startAt: number,
    endAt: number,
    excludeId?: string
  ): Promise<ScheduleConflict[]> => {
    const schedulesRef = collection(db, USERS_COLLECTION, uid, ITEMS_COLLECTION);

    // Query all entries where startAt < newEnd, then filter client-side
    // where newStart < existingEnd.
    const q = query(
      schedulesRef,
      where('startAt', '<', endAt),
      orderBy('startAt', 'asc')
    );

    const snapshot = await getDocs(q);
    const conflicts: ScheduleConflict[] = [];

    for (const docSnap of snapshot.docs) {
      if (excludeId && docSnap.id === excludeId) continue;

      const entry = { id: docSnap.id, ...docSnap.data() } as ScheduleEntry;

      // Second half of overlap check: newStart < existingEnd
      if (startAt < entry.endAt) {
        const overlapStart = Math.max(startAt, entry.startAt);
        const overlapEnd = Math.min(endAt, entry.endAt);
        conflicts.push({ entry, overlapStart, overlapEnd });
      }
    }

    return conflicts;
  },

  // =========================================================================
  // CRUD OPERATIONS
  // =========================================================================

  /**
   * Create a new schedule entry (single movie or episode)
   */
  createSchedule: async (uid: string, data: ScheduleFormData): Promise<ScheduleEntry> => {
    const schedulesRef = collection(db, USERS_COLLECTION, uid, ITEMS_COLLECTION);
    const newDocRef = doc(schedulesRef);

    const endAt = calculateEndTime(data.startAt, data.durationMinutes, data.mediaType);

    const entry: Omit<ScheduleEntry, 'id'> = {
      tmdbId: data.tmdbId,
      mediaType: data.mediaType,
      sourceType: data.sourceType,
      parentSeriesId: data.parentSeriesId ?? null,
      seasonNumber: data.seasonNumber ?? null,
      episodeNumber: data.episodeNumber ?? null,
      episodeTitle: data.episodeTitle ?? null,
      title: data.title,
      posterPath: data.posterPath,
      startAt: data.startAt,
      endAt: endAt,
      durationMinutes: data.durationMinutes ?? (data.mediaType === 'movie' ? DEFAULT_MOVIE_RUNTIME : DEFAULT_EPISODE_RUNTIME),
      timezone: getTimezone(),
      localDateKey: getLocalDateKey(data.startAt),
      status: 'scheduled',
      notes: data.notes ?? null,
      planId: data.planId ?? null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(newDocRef, entry);

    return { id: newDocRef.id, ...entry };
  },

  /**
   * Update an existing schedule entry
   */
  updateSchedule: async (
    uid: string,
    scheduleId: string,
    data: Partial<Pick<ScheduleEntry, 'startAt' | 'durationMinutes' | 'notes' | 'status'>>
  ): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, ITEMS_COLLECTION, scheduleId);

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: Date.now(),
    };

    // Recalculate endAt if startAt or duration changed
    if (data.startAt !== undefined || data.durationMinutes !== undefined) {
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        const existingData = existing.data() as ScheduleEntry;
        const newStart = data.startAt ?? existingData.startAt;
        const newDuration = data.durationMinutes ?? existingData.durationMinutes;
        updateData.endAt = calculateEndTime(newStart, newDuration, existingData.mediaType);
        updateData.startAt = newStart;
        updateData.durationMinutes = newDuration;
        updateData.runtimeMinutes = newDuration;
        updateData.localDateKey = getLocalDateKey(newStart);
      }
    }

    await updateDoc(docRef, updateData);
  },

  /**
   * Delete a single schedule entry
   */
  deleteSchedule: async (uid: string, scheduleId: string): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, ITEMS_COLLECTION, scheduleId);
    await deleteDoc(docRef);
  },

  // =========================================================================
  // TV BATCH OPERATIONS
  // =========================================================================

  /**
   * Create multiple schedule entries in a single batch (for TV show plans)
   */
  createBatchSchedule: async (
    uid: string,
    entries: ScheduleFormData[],
    planId: string
  ): Promise<ScheduleEntry[]> => {
    const batch = writeBatch(db);
    const created: ScheduleEntry[] = [];

    for (const data of entries) {
      const schedulesRef = collection(db, USERS_COLLECTION, uid, ITEMS_COLLECTION);
      const newDocRef = doc(schedulesRef);
      const endAt = calculateEndTime(data.startAt, data.durationMinutes, data.mediaType);

      const entry: Omit<ScheduleEntry, 'id'> = {
        tmdbId: data.tmdbId,
        mediaType: data.mediaType,
        sourceType: data.sourceType,
        parentSeriesId: data.parentSeriesId ?? null,
        seasonNumber: data.seasonNumber ?? null,
        episodeNumber: data.episodeNumber ?? null,
        episodeTitle: data.episodeTitle ?? null,
        title: data.title,
        posterPath: data.posterPath,
        startAt: data.startAt,
        endAt: endAt,
        durationMinutes: data.durationMinutes ?? DEFAULT_EPISODE_RUNTIME,
        timezone: getTimezone(),
        localDateKey: getLocalDateKey(data.startAt),
        status: 'scheduled',
        notes: data.notes ?? null,
        planId: planId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      batch.set(newDocRef, entry);
      created.push({ id: newDocRef.id, ...entry });
    }

    await batch.commit();
    return created;
  },

  /**
   * Delete all schedule entries belonging to a specific plan
   */
  deleteSchedulePlan: async (uid: string, planId: string): Promise<void> => {
    const schedulesRef = collection(db, USERS_COLLECTION, uid, ITEMS_COLLECTION);
    const q = query(schedulesRef, where('planId', '==', planId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    const batch = writeBatch(db);
    for (const docSnap of snapshot.docs) {
      batch.delete(docSnap.ref);
    }
    await batch.commit();

    // Also try to delete metadata doc from users/{uid}/schedule_plans/{planId}
    try {
      const planRef = doc(db, USERS_COLLECTION, uid, 'schedule_plans', planId);
      await deleteDoc(planRef);
    } catch {
      // Ignored if plan metadata does not exist
    }
  },

  /**
   * Save TV Plan metadata
   */
  savePlanMetadata: async (
    uid: string,
    planId: string,
    seriesId: number,
    planType: 'daily_goal' | 'finish_by_date',
    episodesPerDay: number,
    targetEndDate: string | null,
    preferredTimeOfDay: string
  ): Promise<void> => {
    const planRef = doc(db, USERS_COLLECTION, uid, 'schedule_plans', planId);
    await setDoc(planRef, {
      seriesId,
      planType,
      episodesPerDay,
      targetEndDate,
      preferredTimeOfDay,
      timezone: getTimezone(),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },

  // =========================================================================
  // STATUS MANAGEMENT
  // =========================================================================

  /**
   * Update the status of a schedule entry
   */
  updateScheduleStatus: async (
    uid: string,
    scheduleId: string,
    status: ScheduleStatus
  ): Promise<void> => {
    const docRef = doc(db, USERS_COLLECTION, uid, ITEMS_COLLECTION, scheduleId);
    await updateDoc(docRef, {
      status,
      updatedAt: Date.now(),
    });
  },

  // =========================================================================
  // REAL-TIME SUBSCRIPTIONS
  // =========================================================================

  /**
   * Subscribe to schedule changes within a date range (for calendar view)
   */
  subscribeToSchedules: (
    uid: string,
    startRange: number,
    endRange: number,
    callback: (entries: ScheduleEntry[]) => void
  ): (() => void) => {
    const schedulesRef = collection(db, USERS_COLLECTION, uid, ITEMS_COLLECTION);
    const q = query(
      schedulesRef,
      where('startAt', '>=', startRange),
      where('startAt', '<=', endRange),
      orderBy('startAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
      } as ScheduleEntry));
      callback(entries);
    });
  },
};
