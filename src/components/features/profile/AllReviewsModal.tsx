import { useNavigate } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';
import Modal from '@/components/patterns/Modal';
import { getTmdbImageUrl } from '@/utils/image';
import type { Comment } from '@/types/discussions.types';

interface AllReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviews: Comment[];
}

export const AllReviewsModal = ({ isOpen, onClose, reviews }: AllReviewsModalProps) => {
  const navigate = useNavigate();

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
          {reviews.map((review) => {
            const mediaTitle = review.mediaTitle || `${review.mediaType === 'movie' ? 'Movie' : 'TV Show'} #${review.mediaId}`;
            return (
              <div
                key={review.id}
                className="group flex gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-brand-accent/30 transition-standard"
              >
                {/* Poster image / Fallback */}
                <div
                  onClick={() => {
                    onClose();
                    navigate(`/${review.mediaType}/${review.mediaId}`);
                  }}
                  className="w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden bg-card border border-white/10 shrink-0 cursor-pointer shadow-md group-hover:scale-[1.02] transition-standard"
                >
                  {review.posterPath ? (
                    <img
                      src={getTmdbImageUrl(review.posterPath, 'w92')}
                      alt={mediaTitle}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-muted-foreground/40 gap-1">
                      {review.mediaType === 'movie' ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                      <span className="text-[7px] font-bold uppercase">No Poster</span>
                    </div>
                  )}
                </div>

                {/* Content details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        onClick={() => {
                          onClose();
                          navigate(`/${review.mediaType}/${review.mediaId}`);
                        }}
                        className="font-bold text-sm sm:text-base text-white hover:text-brand-accent transition-standard truncate cursor-pointer"
                      >
                        {mediaTitle}
                      </h4>
                      
                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-warning/10 text-warning shrink-0">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-black">{review.rating}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs sm:text-sm text-muted-foreground italic wrap-break-word font-medium leading-relaxed">
                      "{review.content}"
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-[10px] text-white/30 font-bold uppercase tracking-wider mt-2.5">
                    <span>
                      {review.mediaType === 'movie' ? 'Movie' : 'TV Series'}
                    </span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
