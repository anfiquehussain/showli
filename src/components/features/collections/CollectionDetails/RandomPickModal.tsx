import { useNavigate } from 'react-router-dom';
import { Sparkles, ExternalLink } from 'lucide-react';
import type { CollectionMedia } from '@/types/collections.types';
import { getTmdbImageUrl } from '@/utils/image';
import Modal from '@/components/patterns/Modal';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/patterns/StatusBadge';

interface RandomPickModalProps {
  media: CollectionMedia | null;
  onClose: () => void;
  onPickAgain: () => void;
}

const RandomPickModal = ({ media, onClose, onPickAgain }: RandomPickModalProps) => {
  const navigate = useNavigate();

  return (
    <Modal
      isOpen={!!media}
      onClose={onClose}
      title="Lucky Pick"
    >
      {media && (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[2/3] w-48 rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={getTmdbImageUrl(media.poster_path, 'w500')} 
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <StatusBadge status={media.status || 'planned'} />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-warning" />
                <h3 className="text-xl font-bold text-primary">{media.title}</h3>
                <Sparkles className="w-4 h-4 text-warning" />
              </div>
              <p className="text-sm text-text-secondary">
                {new Date(media.release_date).getFullYear()} • {media.vote_average.toFixed(1)} Rating
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
              onClick={() => {
                navigate(`/details/${media.media_type}/${media.tmdb_id}`);
                onClose();
              }}
            >
              <ExternalLink className="w-4 h-4" />
              View Details
            </Button>
            <Button
              variant="secondary"
              className="w-full py-3 rounded-2xl"
              onClick={onPickAgain}
            >
              Pick Again
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RandomPickModal;
