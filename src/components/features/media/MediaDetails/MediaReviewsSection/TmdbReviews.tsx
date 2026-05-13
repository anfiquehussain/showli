import { useState } from 'react';
import { User, Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { useGetReviewsQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

interface TmdbReviewsProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

const TmdbReviews = ({ mediaId, mediaType }: TmdbReviewsProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetReviewsQuery({ id: mediaId, type: mediaType, page });

  if (isLoading) return <div className="h-48 glass-card rounded-3xl animate-pulse" />;
  
  if (isError || !data?.results.length) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/[0.02] border border-dashed border-white/5">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
          <User className="w-5 h-5 text-white/20" />
        </div>
        <p className="text-xs font-bold text-white/20 uppercase tracking-widest">No TMDb reviews found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
          Showing {data.results.length} of {data.total_results} reviews from TMDb
        </p>

        {data.total_pages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-xs font-bold text-white/60">{page} / {data.total_pages}</span>
            <button 
              disabled={page === data.total_pages}
              onClick={() => setPage(p => p + 1)}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
        {data.results.map((review) => (
          <div key={review.id} className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {review.author_details.avatar_path ? (
                    <img 
                      src={getTmdbImageUrl(review.author_details.avatar_path, 'w45')} 
                      alt={review.author}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white/40" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-brand-primary transition-colors line-clamp-1">{review.author}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              
              {review.author_details.rating && (
                <div className="flex items-center gap-1.5 bg-warning/10 border border-warning/20 px-2 py-1 rounded-lg shrink-0">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-[11px] font-black text-warning">{review.author_details.rating}</span>
                </div>
              )}
            </div>

            <ReviewContent content={review.content} />
            
            <a 
              href={review.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-brand-primary transition-colors"
            >
              Source: TMDb
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReviewContent = ({ content }: { content: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = content.length > 300;
  const displayContent = isExpanded ? content : content.slice(0, 300);

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap opacity-80">
        {displayContent}
        {!isExpanded && isLong && "..."}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[10px] font-bold text-brand-primary hover:text-brand-light transition-colors uppercase tracking-widest"
        >
          {isExpanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  );
};

export default TmdbReviews;
