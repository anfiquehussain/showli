import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Calendar, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useConflictCheck } from '../hooks/useConflictCheck';
import type { ScheduleEntry } from '@/types/scheduling.types';

interface RescheduleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleEntry | null;
  onConfirm: (id: string, startAt: number) => Promise<boolean>;
}

export const RescheduleDrawer = ({
  isOpen,
  onClose,
  schedule,
  onConfirm,
}: RescheduleDrawerProps) => {
  const { user } = useAuth();
  
  // Local inputs
  const [dateStr, setDateStr] = useState(() => {
    if (!schedule) return '';
    const d = new Date(schedule.startAt);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [timeStr, setTimeStr] = useState(() => {
    if (!schedule) return '';
    const d = new Date(schedule.startAt);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute start timestamp in epoch ms
  const calculatedStartAt = useMemo(() => {
    if (!dateStr || !timeStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (year === undefined || month === undefined || day === undefined || hours === undefined || minutes === undefined) {
      return null;
    }
    return new Date(year, month - 1, day, hours, minutes).getTime();
  }, [dateStr, timeStr]);

  // Hook into conflict check
  const { conflicts, hasConflicts, isChecking } = useConflictCheck({
    uid: user?.uid,
    startAt: calculatedStartAt,
    durationMinutes: schedule?.durationMinutes ?? 45,
    mediaType: schedule?.mediaType ?? 'episode',
    excludeId: schedule?.id,
  });

  const handleQuickDelay = (mins: number) => {
    if (!schedule) return;
    const d = new Date(schedule.startAt + mins * 60 * 1000);
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    setDateStr(`${YYYY}-${MM}-${DD}`);
    
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setTimeStr(`${hh}:${mm}`);
  };

  const handleMoveToTomorrow = () => {
    if (!schedule) return;
    const d = new Date(schedule.startAt);
    d.setDate(d.getDate() + 1);
    const YYYY = d.getFullYear();
    const MM = String(d.getMonth() + 1).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    setDateStr(`${YYYY}-${MM}-${DD}`);
  };

  const handleSave = async () => {
    if (!schedule || !calculatedStartAt) return;
    setIsSubmitting(true);
    const success = await onConfirm(schedule.id, calculatedStartAt);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  if (!schedule) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer container */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-screen max-w-md bg-zinc-900/95 border-l border-white/10 p-5 flex flex-col justify-between shadow-2xl backdrop-blur-xl h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-white">Reschedule Session</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[280px]">
                    {schedule.title}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto py-5 space-y-6 custom-scrollbar">
                {/* Quick adjustments */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Quick Adjustments
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickDelay(15)}
                      className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer text-center"
                    >
                      Delay 15 Mins
                    </button>
                    <button
                      onClick={() => handleQuickDelay(30)}
                      className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer text-center"
                    >
                      Delay 30 Mins
                    </button>
                    <button
                      onClick={() => handleQuickDelay(60)}
                      className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer text-center"
                    >
                      Delay 1 Hour
                    </button>
                    <button
                      onClick={handleMoveToTomorrow}
                      className="py-2 px-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all cursor-pointer text-center"
                    >
                      Move to Tomorrow
                    </button>
                  </div>
                </div>

                {/* Date/Time Manual */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Choose Time Slot
                  </span>

                  <div className="space-y-1.5">
                    <label htmlFor="reschedule-date" className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      Date
                    </label>
                    <input
                      id="reschedule-date"
                      type="date"
                      value={dateStr}
                      onChange={(e) => setDateStr(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="reschedule-time" className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      Start Time
                    </label>
                    <input
                      id="reschedule-time"
                      type="time"
                      value={timeStr}
                      onChange={(e) => setTimeStr(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                    />
                  </div>
                </div>

                {/* Conflict Warnings */}
                {hasConflicts && (
                  <div className="p-3 bg-warning/10 border border-warning/20 rounded-2xl flex gap-3 text-warning">
                    <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <div className="text-xs space-y-1">
                      <span className="font-black block uppercase tracking-wide">Time Slot Conflict</span>
                      <p className="font-medium">
                        Overlaps with: {conflicts.map(c => `"${c.entry.title}"`).join(', ')}.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-white/5 flex gap-3">
                <Button
                  variant="secondary"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSubmitting || isChecking}
                  className="flex-1 py-2 text-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Move'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RescheduleDrawer;
