import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useScheduling } from '../hooks/useScheduling';
import CalendarDay from './CalendarDay';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/patterns/ConfirmationModal';

export const ScheduleCalendar = () => {

  const { user } = useAuth();

  // Keep track of the start date of the visible week
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    // Get Monday of current week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Calculate start and end range of the week in epoch ms
  const { startRange, endRange, weekDays } = useMemo(() => {
    const days: Date[] = [];
    const tempDate = new Date(currentWeekStart);
    
    // Generate 7 days (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      days.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const start = new Date(currentWeekStart).getTime();
    const end = new Date(days[6] as Date);
    end.setHours(23, 59, 59, 999);

    return {
      startRange: start,
      endRange: end.getTime(),
      weekDays: days,
    };
  }, [currentWeekStart]);

  // Hook handles CRUD and real-time syncing of schedules in date range
  const { schedules, isLoading, updateStatus, deleteSchedule, deletePlan } = useScheduling({
    uid: user?.uid,
    startRange,
    endRange,
  });

  // Organize schedules by date string (YYYY-MM-DD)
  const schedulesByDay = useMemo(() => {
    const map: Record<string, typeof schedules> = {};
    schedules.forEach((entry) => {
      const d = new Date(entry.startAt);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(entry);
    });
    return map;
  }, [schedules]);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    setCurrentWeekStart(monday);
  };

  // Group unique plan IDs in the current week for quick batch deletion
  const activePlanIds = useMemo(() => {
    const ids = new Set<string>();
    schedules.forEach((entry) => {
      if (entry.planId) ids.add(entry.planId);
    });
    return Array.from(ids);
  }, [schedules]);

  const [planIdToDelete, setPlanIdToDelete] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const handleDeletePlan = (planId: string) => {
    setPlanIdToDelete(planId);
  };

  const handleConfirmDelete = async () => {
    if (!planIdToDelete) return;
    setIsDeleteLoading(true);
    await deletePlan(planIdToDelete);
    setIsDeleteLoading(false);
    setPlanIdToDelete(null);
  };


  const formatWeekRange = () => {
    const opt: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${currentWeekStart.toLocaleDateString([], opt)} – ${(weekDays[6] as Date).toLocaleDateString([], opt)}, ${currentWeekStart.getFullYear()}`;
  };

  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Calendar Controller Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-white/5 border border-white/10 rounded-3xl">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-brand-primary" />
          <h2 className="text-sm font-heading font-black text-white uppercase tracking-wider">
            {formatWeekRange()}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleToday}
            className="h-8 text-xs font-bold"
          >
            Today
          </Button>
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden h-8">
            <button
              onClick={handlePrevWeek}
              className="px-3 hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <button
              onClick={handleNextWeek}
              className="px-3 hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Batch Plan Deletion Controls */}
      {activePlanIds.length > 0 && (
        <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-white/3 border border-white/5">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center">
            Active Season Plans:
          </span>
          {activePlanIds.map((planId) => (
            <button
              key={planId}
              onClick={() => handleDeletePlan(planId)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-error/10 border border-error/20 hover:bg-error/20 text-error text-[10px] font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Season Plan</span>
            </button>
          ))}
        </div>
      )}

      {/* Calendar Grid (Weekly column grid on large, flex stacks on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {isLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="min-h-[160px] bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          ))
        ) : (
          weekDays.map((day) => {
            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
            const daySchedules = schedulesByDay[dateStr] || [];
            const isToday = dateStr === todayStr;

            return (
              <CalendarDay
                key={dateStr}
                date={day}
                schedules={daySchedules}
                isToday={isToday}
                onStatusChange={updateStatus}
                onDelete={deleteSchedule}
              />
            );
          })
        )}
      </div>

      <ConfirmationModal
        isOpen={planIdToDelete !== null}
        onClose={() => setPlanIdToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Season Plan"
        message="Are you sure you want to remove this entire show scheduling plan? All scheduled episodes for this plan will be removed from your calendar."
        confirmLabel="Remove Plan"
        cancelLabel="Keep Plan"
        variant="danger"
        isLoading={isDeleteLoading}
      />
    </div>
  );
};

export default ScheduleCalendar;
