interface DateTimePickerProps {
  selectedDate: string | null;         // ISO date string YYYY-MM-DD
  selectedTime: string;                // HH:mm
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

/**
 * Clean, direct date and time inputs for scheduling media.
 */
const DateTimePicker = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) => {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formatTime12 = (time24: string): string => {
    const parts = time24.split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Selector */}
        <div className="space-y-1.5">
          <label htmlFor="schedule-date" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Date
          </label>
          <input
            id="schedule-date"
            type="date"
            min={todayStr}
            value={selectedDate ?? ''}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
          />
        </div>

        {/* Time Selector */}
        <div className="space-y-1.5">
          <label htmlFor="schedule-time" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Time
          </label>
          <input
            id="schedule-time"
            type="time"
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Selected Watch Time Preview */}
      {selectedDate && (
        <div className="pt-2 border-t border-white/5">
          <p className="text-xs text-muted-foreground">
            Selected watch time: <span className="text-white font-bold">{selectedDate}</span> at <span className="text-white font-bold">{formatTime12(selectedTime)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
