import Modal from '@/components/patterns/Modal';
import ProfileReviewCard from './ProfileReviewCard';
import type { Comment } from '@/types/discussions.types';

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Comment[];
}

export const AllReviewsModal = ({ isOpen, onClose, reviews }: AllReviewsModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="All Reviews" 
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold opacity-60">
          Showing your complete rating and review history ({reviews.length} total)
        </p>

        <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {reviews.map((review) => (
            <ProfileReviewCard
              key={review.id}
              review={review}
              onNavigate={onClose}
              size="md"
            />
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold uppercase tracking-widest text-xs bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AllReviewsModal;
