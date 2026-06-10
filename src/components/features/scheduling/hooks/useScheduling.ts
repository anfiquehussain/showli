import { useState, useEffect, useCallback } from 'react';

import { schedulingService } from '@/api/scheduling/schedulingService';
import { useToast } from '@/hooks/useToast';

import type {
  ScheduleEntry,
  ScheduleFormData,
  ScheduleStatus,
} from '@/types/scheduling.types';

interface UseSchedulingOptions {
  uid: string | undefined;
  startRange?: number;
  endRange?: number;
}

interface UseSchedulingReturn {
  schedules: ScheduleEntry[];
  isLoading: boolean;
  createSchedule: (data: ScheduleFormData) => Promise<ScheduleEntry | null>;
  updateSchedule: (scheduleId: string, data: Partial<Pick<ScheduleEntry, 'startAt' | 'durationMinutes' | 'notes' | 'status'>>) => Promise<boolean>;
  deleteSchedule: (scheduleId: string) => Promise<boolean>;
  updateStatus: (scheduleId: string, status: ScheduleStatus) => Promise<boolean>;
  createBatchSchedule: (entries: ScheduleFormData[], planId: string) => Promise<ScheduleEntry[]>;
  deletePlan: (planId: string) => Promise<boolean>;
  refresh: () => void;
}

/**
 * Core scheduling hook — manages schedule data, CRUD, and real-time sync.
 */
export const useScheduling = ({
  uid,
  startRange,
  endRange,
}: UseSchedulingOptions): UseSchedulingReturn => {
  const hasValidParams = !!uid && startRange !== undefined && endRange !== undefined;
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(hasValidParams);
  const toast = useToast();

  const [prevHasValidParams, setPrevHasValidParams] = useState(hasValidParams);
  if (hasValidParams !== prevHasValidParams) {
    setPrevHasValidParams(hasValidParams);
    if (!hasValidParams) {
      setSchedules([]);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }

  // Real-time subscription to schedules within the date range
  useEffect(() => {
    if (!uid || startRange === undefined || endRange === undefined) {
      return;
    }

    const unsubscribe = schedulingService.subscribeToSchedules(
      uid,
      startRange,
      endRange,
      (entries) => {
        setSchedules(entries);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [uid, startRange, endRange]);

  const refresh = useCallback(() => {
    if (!uid || startRange === undefined || endRange === undefined) return;
    setIsLoading(true);
    schedulingService.getSchedules(uid, startRange, endRange).then((entries) => {
      setSchedules(entries);
      setIsLoading(false);
    });
  }, [uid, startRange, endRange]);

  const createSchedule = useCallback(async (data: ScheduleFormData): Promise<ScheduleEntry | null> => {
    if (!uid) return null;
    try {
      const entry = await schedulingService.createSchedule(uid, data);
      toast.success('Scheduled successfully!');
      return entry;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create schedule';
      toast.error(message);
      return null;
    }
  }, [uid, toast]);

  const updateSchedule = useCallback(async (
    scheduleId: string,
    data: Partial<Pick<ScheduleEntry, 'startAt' | 'durationMinutes' | 'notes' | 'status'>>
  ): Promise<boolean> => {
    if (!uid) return false;
    try {
      await schedulingService.updateSchedule(uid, scheduleId, data);
      toast.success('Schedule updated');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update schedule';
      toast.error(message);
      return false;
    }
  }, [uid, toast]);

  const deleteSchedule = useCallback(async (scheduleId: string): Promise<boolean> => {
    if (!uid) return false;
    try {
      await schedulingService.deleteSchedule(uid, scheduleId);
      toast.success('Schedule removed');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete schedule';
      toast.error(message);
      return false;
    }
  }, [uid, toast]);

  const updateStatus = useCallback(async (scheduleId: string, status: ScheduleStatus): Promise<boolean> => {
    if (!uid) return false;
    try {
      await schedulingService.updateScheduleStatus(uid, scheduleId, status);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
      return false;
    }
  }, [uid, toast]);

  const createBatchSchedule = useCallback(async (
    entries: ScheduleFormData[],
    planId: string
  ): Promise<ScheduleEntry[]> => {
    if (!uid) return [];
    try {
      const created = await schedulingService.createBatchSchedule(uid, entries, planId);
      toast.success(`Scheduled ${created.length} episodes`);
      return created;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create schedule plan';
      toast.error(message);
      return [];
    }
  }, [uid, toast]);

  const deletePlan = useCallback(async (planId: string): Promise<boolean> => {
    if (!uid) return false;
    try {
      await schedulingService.deleteSchedulePlan(uid, planId);
      toast.success('Schedule plan removed');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete plan';
      toast.error(message);
      return false;
    }
  }, [uid, toast]);

  return {
    schedules,
    isLoading,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    updateStatus,
    createBatchSchedule,
    deletePlan,
    refresh,
  };
};
