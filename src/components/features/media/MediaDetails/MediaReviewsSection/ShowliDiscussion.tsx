import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Star } from 'lucide-react';
import { discussionsService } from '@/api/discussions/discussionsService';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import ConfirmationModal from '@/components/patterns/ConfirmationModal';
import type { Comment, CommentWithReplies } from '@/types/discussions.types';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

import { useToast } from '@/hooks/useToast';

interface ShowliDiscussionProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

const ShowliDiscussion = ({ mediaId, mediaType }: ShowliDiscussionProps) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [visibleCount, setVisibleCount] = useState(5);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = discussionsService.subscribeToComments(
      mediaId,
      mediaType,
      (data) => {
        setComments(data);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [mediaId, mediaType]);

  const threadedComments = useMemo(() => {
    const map = new Map<string, CommentWithReplies>();
    const roots: CommentWithReplies[] = [];

    // Initialize map
    comments.forEach((c) => {
      map.set(c.id, { ...c, replies: [] });
    });

    // Build tree
    comments.forEach((c) => {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort roots based on selected criteria
    roots.sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

    // Sort replies by date (older first for conversations)
    map.forEach(node => {
      node.replies.sort((a, b) => a.createdAt - b.createdAt);
    });

    return roots;
  }, [comments, sortBy]);

  const handleAddComment = async (content: string, rating: number | null) => {
    if (!user) return;
    try {
      await discussionsService.addComment({
        mediaId,
        mediaType,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL,
        content,
        rating,
        parentId: null,
      });
      success(rating !== null ? 'Review shared!' : 'Comment posted!');
      setIsReviewModalOpen(false);
    } catch (err) {
      toastError('Failed to post. Please try again.');
    }
  };

  const handleReply = async (content: string, parentId: string) => {
    if (!user) return;
    try {
      await discussionsService.addComment({
        mediaId,
        mediaType,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userAvatar: user.photoURL,
        content,
        rating: null,
        parentId,
      });
      success('Reply posted!');
    } catch (err) {
      toastError('Failed to reply.');
    }
  };

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (!user) return;
    try {
      await discussionsService.toggleLike(commentId, user.uid, isLiked);
    } catch (err) {
      toastError('Action failed.');
    }
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    try {
      await discussionsService.deleteComment(commentToDelete);
      success('Comment deleted.');
      setCommentToDelete(null);
    } catch (err) {
      toastError('Failed to delete.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-white/5 rounded-3xl" />
      <div className="h-20 bg-white/5 rounded-3xl" />
    </div>;
  }

  const reviewCount = comments.filter(c => c.rating !== null).length;
  const avgRating = reviewCount > 0 
    ? comments.reduce((acc, curr) => acc + (curr.rating || 0), 0) / reviewCount 
    : 0;

  return (
    <div className="space-y-8">
      {/* Discussion Stats & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Showli Rating</span>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-primary fill-brand-primary" />
              <span className="text-xl font-black text-white">{avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}</span>
              <span className="text-xs text-white/40 font-bold ml-1">({reviewCount} reviews)</span>
            </div>
          </div>
          <div className="w-px h-10 bg-white/5" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">Discussion</span>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand-secondary" />
              <span className="text-xl font-black text-white">{comments.length}</span>
              <span className="text-xs text-white/40 font-bold ml-1">total items</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="flex-1 sm:flex-initial bg-card border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-white/60 hover:text-white hover:border-white/20 transition-all outline-none cursor-pointer appearance-none"
          >
            <option value="newest" className="bg-card text-white">Sort by: Newest</option>
            <option value="oldest" className="bg-card text-white">Sort by: Oldest</option>
            <option value="rating" className="bg-card text-white">Sort by: Highest Rating</option>
          </select>

          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => setIsReviewModalOpen(true)}
            className="gap-1.5 md:gap-2 shadow-lg shadow-brand-primary/20 text-[10px] md:text-xs px-3 md:px-5"
          >
            <Star className="w-3 md:w-3.5 h-3 md:h-3.5 fill-current" />
            <span className="hidden xs:inline">Write Review</span>
            <span className="xs:hidden">Review</span>
          </Button>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-[95vw] sm:w-full max-w-lg bg-card border border-white/10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Fixed Header */}
              <div className="flex items-center justify-between p-4 md:p-8 border-b border-white/5 shrink-0">
                <div className="space-y-1">
                  <h3 className="text-lg md:text-xl font-heading font-black text-white tracking-tight">Share review</h3>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">How was it?</p>
                </div>
                <button 
                  onClick={() => setIsReviewModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-colors"
                >
                  <Star className="w-4 h-4 rotate-45" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar">
                <CommentForm 
                  onSubmit={handleAddComment} 
                  showRating 
                  placeholder="Share your thoughts..."
                  autoFocus
                  isNaked
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Threaded Comments List */}
      <div className="space-y-6">
        {threadedComments.length > 0 ? (
          <>
            {threadedComments.slice(0, visibleCount).map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleReply}
                onLike={handleLike}
                onDelete={(id: string) => setCommentToDelete(id)}
              />
            ))}

            {visibleCount < threadedComments.length && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white/40 hover:text-white hover:bg-white/10 transition-all shadow-xl"
                >
                  Load more reviews
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white/10" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">No discussions yet</p>
              <p className="text-xs text-white/20 mt-1">Be the first to start the conversation!</p>
            </div>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={commentToDelete !== null}
        onClose={() => setCommentToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ShowliDiscussion;
