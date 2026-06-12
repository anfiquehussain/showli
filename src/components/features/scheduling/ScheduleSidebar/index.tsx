import { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { ScheduleEntry } from '@/types/scheduling.types';

interface ScheduleSidebarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onClearDate: () => void;
  schedules: ScheduleEntry[];
}

export const ScheduleSidebar = ({
  selectedDate,
  onDateSelect,
  onClearDate,
  schedules,
}: ScheduleSidebarProps) => {
  const [navMonth, setNavMonth] = useState(() => new Date());
  
  // Collapse/Expand state for mobile devices, persisting in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('showli_calendar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem('showli_calendar_collapsed', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Generate days in the navigation month
  const calendarDays = useMemo(() => {
    const year = navMonth.getFullYear();
    const month = navMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const firstDayIndex = firstDay.getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [navMonth]);

  const handlePrevMonth = () => {
    setNavMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatMonthYear = () => {
    return navMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });
  };

  const isSelected = (day: Date | null) => {
    if (!day) return false;
    return day.getDate() === selectedDate.getDate() &&
           day.getMonth() === selectedDate.getMonth() &&
           day.getFullYear() === selectedDate.getFullYear();
  };

  const isToday = (day: Date | null) => {
    if (!day) return false;
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  };

  const getDotColor = (day: Date) => {
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${date}`;

    const items = schedules.filter(s => s.localDateKey === dateKey && s.status !== 'cancelled');
    if (items.length === 0) return null;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayMs = startOfToday.getTime();

    // Red: Skipped day OR Missed day (at least one scheduled item whose startAt is before today)
    const hasSkipped = items.some(s => s.status === 'skipped');
    const hasMissed = items.some(s => s.status === 'scheduled' && s.startAt < startOfTodayMs);
    if (hasSkipped || hasMissed) {
      return 'bg-calendar-dot-red';
    }

    // Green: All items on this day are completed
    const allCompleted = items.every(s => s.status === 'completed');
    if (allCompleted) {
      return 'bg-calendar-dot-green';
    }

    // Blue: ShowLi Brand Primary Blue (#6366f1)
    return 'bg-calendar-dot-blue';
  };

  return (
    <div className="space-y-4 bg-white/2 border border-white/5 rounded-2xl p-4 select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <button
          onClick={toggleCollapse}
          className="flex items-center gap-2 text-white hover:text-brand-primary transition-colors cursor-pointer select-none md:pointer-events-none text-left"
        >
          <Calendar className="w-4 h-4 text-brand-primary" aria-hidden="true" />
          <span className="text-xs font-black uppercase tracking-wider">{formatMonthYear()}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 md:hidden ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevMonth}
            className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            aria-label="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Content Wrapper */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isCollapsed
          ? 'max-h-0 opacity-0 pointer-events-none md:max-h-[500px] md:opacity-100 md:pointer-events-auto'
          : 'max-h-[500px] opacity-100'
      }`}>
        <div className="space-y-4 pt-2">
          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
          <span key={idx} className="text-[9px] font-black text-muted-foreground/60">
            {day}
          </span>
        ))}

        {/* Days grid */}
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="w-full h-10" />;
          const selected = isSelected(day);
          const today = isToday(day);
          const dotColor = getDotColor(day);

          return (
            <div key={day.toISOString()} className="flex flex-col justify-between items-center w-full h-10 py-0.5">
              <button
                onClick={() => onDateSelect(day)}
                className={`h-7 w-7 text-[10px] font-bold rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  selected
                    ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                    : today
                      ? 'bg-brand-primary/10 border border-brand-primary/20 text-brand-primary'
                      : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {day.getDate()}
              </button>
              
              <div className="h-1.5 flex items-center justify-center">
                {dotColor ? (
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                ) : (
                  <span className="w-1.5 h-1.5 block" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Clear Date filter when active */}
      {!isToday(selectedDate) && (
        <button
          onClick={onClearDate}
          className="w-full mt-2 py-1.5 bg-white/5 hover:bg-white/8 border border-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          Reset to Today
        </button>
      )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleSidebar;
