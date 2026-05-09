import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User as UserIcon, 
  Heart, 
  Trash2, 
  Reply, 
  ChevronRight, 
  ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import type { CommentWithReplies } from '@/types/discussions.types';
import Rating from '@/components/ui/Rating';
import CommentForm from './CommentForm';

interface CommentItemProps {
  comment: CommentWithReplies;
  onReply: (content: string, parentId: string) => Promise<void>;
  onLike: (commentId: string, isLiked: boolean) => Promise<void>;
  onDelete?: (commentId: string) => void | Promise<void>;
  level?: number;
  parentUserName?: string;
}

const CommentItem = ({
  comment,
  onReply,
  onLike,
  onDelete,
  level = 0,
  parentUserName,
}: CommentItemProps) => {
  const { user } = useAuth();
  // Automatically collapse deep threads (Level 2+) to keep the UI clean
  const [isCollapsed, setIsCollapsed] = useState(level >= 2);
  const [isReplying, setIsReplying] = useState(false);
  
  const isLiked = user ? comment.likes.includes(user.uid) : false;
  const isAuthor = user?.uid === comment.userId;
  const isDeleted = comment.isDeleted;

  const isTopLevel = level === 0;
  const nextLevel = level + 1;

  // Progressive Indentation: More pronounced indentation for clear hierarchy
  const getIndentationClass = () => {
    if (level === 0) return '';
    return 'ml-4 md:ml-10'; // Refined indentation for mobile/desktop
  };

  const handleReply = async (content: string) => {
    await onReply(content, comment.id);
    setIsReplying(false);
  };

  const totalThreadReplies = useMemo(() => {
    let count = 0;
    const countAll = (replies: any[]) => {
      count += replies.length;
      replies.forEach(r => countAll(r.replies));
    };
    countAll(comment.replies);
    return count;
  }, [comment.replies]);

  return (
    <div className={`relative ${getIndentationClass()} group/item`}>
      {/* Visual Thread Rail (Solid line connecting to parent) */}
      {!isTopLevel && (
        <div 
          className="absolute -left-2.5 md:-left-5 top-0 bottom-0 w-[2px] bg-white/[0.08] group-hover/item:bg-brand-primary/40 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/10 border border-white/10" />
        </div>
      )}

      <div className="relative">
        {/* Comment Card */}
        <div className={`
          relative transition-all duration-300
          ${isCollapsed ? 'py-1.5 px-3 bg-white/[0.02] rounded-xl border border-white/5 opacity-50' : ''}
          ${!isCollapsed && isTopLevel ? 'bg-white/[0.04] border border-white/10 rounded-2xl p-4 md:p-6 mb-4 md:mb-8 shadow-2xl' : ''}
          ${!isCollapsed && !isTopLevel ? 'bg-white/[0.01] border border-white/5 rounded-xl p-3 md:p-5 mb-2 md:mb-4' : ''}
          ${isDeleted ? 'opacity-40 grayscale-[0.5]' : ''}
          hover:border-white/20
        `}>
          
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!isCollapsed && (
                <div className={`
                  rounded-full bg-white/5 border border-white/10 
                  flex items-center justify-center overflow-hidden shrink-0
                  ${isTopLevel ? 'w-10 h-10' : 'w-8 h-8'}
                `}>
                  {comment.userAvatar && !isDeleted ? (
                    <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className={`${isTopLevel ? 'w-5 h-5' : 'w-4 h-4'} text-white/20`} />
                  )}
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-white ${isTopLevel ? 'text-base' : 'text-sm'} ${isDeleted ? 'text-white/40 italic' : ''}`}>
                    {isDeleted ? '[deleted]' : comment.userName}
                  </span>
                  
                  {isTopLevel && comment.rating !== null && !isCollapsed && (
                    <Rating value={comment.rating} size="sm" />
                  )}

                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold opacity-40">
                    {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                  </span>
                </div>

                {parentUserName && !isCollapsed && (
                  <div className="flex items-center gap-1.5 text-[10px] text-brand-primary/60 font-black uppercase tracking-tighter">
                    <Reply className="w-2.5 h-2.5" />
                    <span>Replying to</span>
                    <span className="text-brand-primary">@{parentUserName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Collapse / Info */}
            <div className="flex items-center gap-2">
              {isCollapsed && (
                <button 
                  onClick={() => setIsCollapsed(false)}
                  className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/20 rounded-full transition-all group/expand"
                >
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-tighter">
                    {totalThreadReplies > 0 ? `Show ${totalThreadReplies} replies` : 'Show comment'}
                  </span>
                  <ChevronRight className="w-3 h-3 text-brand-primary group-hover/expand:translate-x-0.5 transition-transform" />
                </button>
              )}
              {!isCollapsed && !isTopLevel && (
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"
                  title="Collapse thread"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className={`
                  mt-3 md:mt-4 text-white/80 leading-relaxed font-medium whitespace-pre-wrap
                  ${isTopLevel ? 'text-sm md:text-base' : 'text-[13px] md:text-sm'}
                  ${isDeleted ? 'italic text-white/20' : ''}
                `}>
                  {isDeleted ? '[deleted]' : comment.content}
                </div>

                {!isDeleted && (
                  <div className="mt-4 md:mt-6 flex items-center gap-4">
                    <button 
                      onClick={() => onLike(comment.id, isLiked)}
                      className={`
                        flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-tighter md:tracking-widest transition-all px-2 md:px-3 py-1 md:py-1.5 rounded-full border
                        ${isLiked 
                          ? 'bg-brand-primary/20 text-brand-primary border-brand-primary/30' 
                          : 'text-white/20 hover:text-white hover:bg-white/5 border-transparent'
                        }
                      `}
                    >
                      <Heart className={`w-2.5 md:w-3 h-2.5 md:h-3 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes.length || 'Like'}</span>
                    </button>
                    
                    <button 
                      onClick={() => setIsReplying(!isReplying)}
                      className={`
                        flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-tighter md:tracking-widest transition-all px-2 md:px-3 py-1 md:py-1.5 rounded-full border
                        ${isReplying 
                          ? 'bg-white/10 text-white border-white/20' 
                          : 'text-white/20 hover:text-white hover:bg-white/5 border-transparent'
                        }
                      `}
                    >
                      <Reply className="w-2.5 md:w-3 h-2.5 md:h-3" />
                      <span>Reply</span>
                    </button>

                    {isAuthor && onDelete && (
                      <button 
                        onClick={() => onDelete(comment.id)}
                        className="ml-auto p-2 rounded-lg hover:bg-error/10 text-white/10 hover:text-error transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form & Sub-Replies */}
        {!isCollapsed && (
          <div className="space-y-4">
            {isReplying && (
              <div className="ml-5 md:ml-10 animate-in slide-in-from-top-2 duration-300">
                <CommentForm 
                  onSubmit={handleReply}
                  placeholder={`Reply to ${comment.userName}...`}
                  autoFocus
                />
              </div>
            )}

            {comment.replies.length > 0 && (
              <div className="space-y-4">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onReply={onReply}
                    onLike={onLike}
                    onDelete={onDelete}
                    level={nextLevel}
                    parentUserName={isDeleted ? '[deleted]' : comment.userName}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
