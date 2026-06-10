import { useState, useEffect, useCallback, useRef } from 'react';

import { schedulingService } from '@/api/scheduling/schedulingService';

import type { ScheduleConflict } from '@/types/scheduling.types';
import { DEFAULT_MOVIE_RUNTIME, DEFAULT_EPISODE_RUNTIME } from '@/types/scheduling.types';

interface UseConflictCheckOptions {
  uid: string | undefined;
  startAt: number | null;
  durationMinutes: number | null;
  mediaType: 'movie' | 'tv' | 'episode' | 'other';
  excludeId?: string;
  debounceMs?: number;
}

interface UseConflictCheckReturn {
  conflicts: ScheduleConflict[];
  isChecking: boolean;
  hasConflicts: boolean;
}

/**
 * Debounced conflict checking hook.
 * Automatically checks for conflicts when startAt or duration changes.
 */
export const useConflictCheck = ({
  uid,
  startAt,
  durationMinutes,
  mediaType,
  excludeId,
  debounceMs = 300,
}: UseConflictCheckOptions): UseConflictCheckReturn => {
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConflicts = useCallback(async () => {
    if (!uid || startAt === null) {
      setConflicts([]);
      return;
    }

    const fallbackDuration = mediaType === 'movie' ? DEFAULT_MOVIE_RUNTIME : DEFAULT_EPISODE_RUNTIME;
    const duration = (durationMinutes ?? fallbackDuration) * 60 * 1000;
    const endAt = startAt + duration;

    setIsChecking(true);
    try {
      const result = await schedulingService.checkConflicts(uid, startAt, endAt, excludeId);
      setConflicts(result);
    } catch {
      // On error, assume no conflicts rather than block the user
      setConflicts([]);
    } finally {
      setIsChecking(false);
    }
  }, [uid, startAt, durationMinutes, mediaType, excludeId]);

  // Reset conflicts during render if startAt is null to avoid synchronous setState inside useEffect
  if (startAt === null && conflicts.length > 0) {
    setConflicts([]);
  }

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (startAt === null) {
      return;
    }

    timerRef.current = setTimeout(() => {
      checkConflicts();
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [checkConflicts, debounceMs, startAt]);

  return {
    conflicts,
    isChecking,
    hasConflicts: conflicts.length > 0,
  };
};
