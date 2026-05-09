import { useState } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import RatingPicker from './RatingPicker';

interface CommentFormProps {
  onSubmit: (content: string, rating: number | null) => Promise<void>;
  placeholder?: string;
  autoFocus?: boolean;
  showRating?: boolean;
  isNaked?: boolean;
}

const CommentForm = ({
  onSubmit,
  placeholder = "Write your thoughts...",
  autoFocus = false,
  showRating = false,
  isNaked = false,
}: CommentFormProps) => {
  const { user, isAuthenticated, openModal } = useAuth();
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content, rating);
      setContent('');
      setRating(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    const loginBoxStyles = isNaked 
      ? "flex flex-col items-center justify-center gap-6 text-center py-12"
      : "bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 text-center shadow-2xl";

    return (
      <div className={loginBoxStyles}>
        <div className="w-16 h-16 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center">
          <UserIcon className="w-8 h-8 text-brand-primary" />
        </div>
        <div className="space-y-2 max-w-xs">
          <h4 className="text-xl font-heading font-bold text-white">Join the Community</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign in to share your reviews, rate movies, and engage with other fans.
          </p>
        </div>
        <Button 
          variant="primary" 
          size="md" 
          onClick={() => openModal('login')}
          className="px-8"
        >
          Sign In Now
        </Button>
      </div>
    );
  }

  const formStyles = isNaked
    ? "space-y-4 md:space-y-6 w-full"
    : "bg-white/[0.02] border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl space-y-4 md:space-y-6";

  return (
    <form onSubmit={handleSubmit} className={formStyles}>
      <div className="flex flex-col gap-6">
        {/* Rating Header (Only for reviews) */}
        {showRating && (
          <div className="space-y-3 pb-6 border-b border-white/5">
            <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em]">Your Rating</span>
            <RatingPicker value={rating} onChange={setRating} />
          </div>
        )}

        <div className="flex gap-3 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-brand-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0 space-y-4">
            <textarea
              id="comment-input"
              name="comment-content"
              autoFocus={autoFocus}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={4}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-5 text-sm md:text-base text-white placeholder:text-white/20 focus:outline-none focus:border-brand-primary/50 focus:bg-white/[0.05] transition-all resize-none shadow-inner"
            />

            <div className="flex items-center justify-between gap-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${content.length > 500 ? 'text-error' : 'text-white/20'}`}>
                {content.length} / 1000
              </span>
              
              <Button 
                type="submit" 
                size="sm" 
                disabled={!content.trim() || isSubmitting}
                className="gap-1.5 md:gap-2 px-6 md:px-8 shadow-lg shadow-brand-primary/20 text-[10px] md:text-xs h-9 md:h-10 shrink-0"
              >
                {isSubmitting ? (
                  <div className="w-3 md:w-4 h-3 md:h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3 md:w-4 h-3 md:h-4" />
                )}
                {showRating ? 'Post Review' : 'Post Reply'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
