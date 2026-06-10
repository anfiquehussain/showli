import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';
import DateTimePicker from './DateTimePicker';
import ConflictWarning from './ConflictWarning';
import { useAuth } from '@/hooks/useAuth';
import { useConflictCheck } from '../hooks/useConflictCheck';
import { useScheduling } from '../hooks/useScheduling';
import type { ScheduleFormData } from '@/types/scheduling.types';
import { DEFAULT_MOVIE_RUNTIME, DEFAULT_EPISODE_RUNTIME } from '@/types/scheduling.types';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaId: number;
  mediaType: 'movie' | 'tv' | 'episode' | 'other';
  title: string;
  posterPath: string | null;
  runtime: number | null;
  // TV episode specific details (if scheduling a single episode)
  seasonNumber?: number;
  episodeNumber?: number;
}

export const ScheduleModal = ({
  isOpen,
  onClose,
  mediaId,
  mediaType,
  title,
  posterPath,
  runtime,
  seasonNumber,
  episodeNumber,
}: ScheduleModalProps) => {
  const { user, openModal: openAuthModal } = useAuth();
  const { createSchedule } = useScheduling({ uid: user?.uid });

  const todayStr = new Date().toISOString().split('T')[0] || '';
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('20:00'); // Default 8 PM
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse date and time into epoch ms
  const startEpoch = useMemo(() => {
    if (!selectedDate) return null;
    const dateParts = selectedDate.split('-').map(Number);
    const year = dateParts[0] ?? new Date().getFullYear();
    const month = dateParts[1] ?? (new Date().getMonth() + 1);
    const day = dateParts[2] ?? new Date().getDate();

    const timeParts = selectedTime.split(':').map(Number);
    const hours = timeParts[0] ?? 20;
    const minutes = timeParts[1] ?? 0;

    // Construct local date and convert to epoch
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    return dateObj.getTime();
  }, [selectedDate, selectedTime]);

  const fallbackDuration = mediaType === 'movie' ? DEFAULT_MOVIE_RUNTIME : DEFAULT_EPISODE_RUNTIME;
  const duration = runtime ?? fallbackDuration;

  // Conflict Checking
  const { conflicts, isChecking, hasConflicts } = useConflictCheck({
    uid: user?.uid,
    startAt: startEpoch,
    durationMinutes: duration,
    mediaType,
  });

  const handleConfirm = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!startEpoch) return;

    setIsSubmitting(true);
    const formData: ScheduleFormData = {
      tmdbId: mediaId,
      mediaType: mediaType === 'tv' && seasonNumber !== undefined ? 'episode' : mediaType,
      sourceType: 'manual',
      parentSeriesId: mediaType === 'tv' ? mediaId : null,
      seasonNumber: seasonNumber ?? null,
      episodeNumber: episodeNumber ?? null,
      title,
      posterPath: posterPath,
      startAt: startEpoch,
      durationMinutes: duration,
      notes: notes.trim() || undefined,
    };

    const result = await createSchedule(formData);
    setIsSubmitting(false);
    if (result) {
      onClose();
    }
  };

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
          className="relative w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh] backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
            <div>
              <h2 className="text-base font-bold text-white">Schedule Media</h2>
              <p className="text-xs text-muted-foreground truncate max-w-[320px]">
                {title} {seasonNumber !== undefined && `· S${seasonNumber}E${episodeNumber}`}
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
            <DateTimePicker
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateChange={setSelectedDate}
              onTimeChange={setSelectedTime}
            />

            {/* Notes Input */}
            <div className="space-y-1.5">
              <label htmlFor="schedule-notes" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Notes (Optional)
              </label>
              <textarea
                id="schedule-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a reminder or watch notes..."
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-muted-foreground/50 resize-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-brand-primary/50 transition-colors"
              />
            </div>

            {/* Conflict Warnings */}
            {startEpoch && (
              <ConflictWarning conflicts={conflicts} isChecking={isChecking} />
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/5 bg-black/20 flex gap-3 shrink-0">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              disabled={hasConflicts || isChecking || isSubmitting || !selectedDate}
              className="flex-1 py-2"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Schedule'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ScheduleModal;
