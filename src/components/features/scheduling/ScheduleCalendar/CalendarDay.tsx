import type { ScheduleEntry, ScheduleStatus } from '@/types/scheduling.types';
import ScheduleCard from './ScheduleCard';

interface CalendarDayProps {
  date: Date;
  schedules: ScheduleEntry[];
  isToday: boolean;
  onStatusChange: (id: string, status: ScheduleStatus) => void;
  onDelete: (id: string) => void;
}

export const CalendarDay = ({
  date,
  schedules,
  isToday,
  onStatusChange,
  onDelete,
}: CalendarDayProps) => {
  const formatDayName = (d: Date): string => {
    return d.toLocaleDateString([], { weekday: 'short' });
  };

  const formatDayNum = (d: Date): string => {
    return d.getDate().toString();
  };

  return (
    <div
      className={`flex flex-col min-h-[160px] p-3 rounded-2xl border transition-colors ${
        isToday
          ? 'bg-brand-primary/5 border-brand-primary/30 shadow-lg shadow-brand-primary/2'
          : 'bg-white/3 border-white/5'
      }`}
    >
      {/* Day Header */}
      <div className="flex items-baseline justify-between mb-3 border-b border-white/5 pb-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {formatDayName(date)}
        </span>
        <span
          className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded-full ${
            isToday ? 'bg-brand-primary text-white' : 'text-white/95'
          }`}
        >
          {formatDayNum(date)}
        </span>
      </div>

      {/* Scheduled Items list */}
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[140px] custom-scrollbar">
        {schedules.length > 0 ? (
          schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="h-full flex items-center justify-center text-[10px] text-muted-foreground/30 font-bold uppercase tracking-wider select-none py-6">
            Free Slot
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
