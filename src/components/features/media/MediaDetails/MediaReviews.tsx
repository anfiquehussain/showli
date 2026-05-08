import { useState } from 'react';
import { User, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useGetReviewsQuery } from '@/api/media/mediaApi';
import { getTmdbImageUrl } from '@/utils/image';

interface MediaReviewsProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaReviews = ({ id, type }: MediaReviewsProps) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useGetReviewsQuery({ id, type, page });

  if (isLoading) return <div className="h-48 glass-card rounded-3xl animate-pulse" />;
  
  if (isError || !data?.results.length) {
    return (
      <section className="space-y-6 pt-8 border-t border-white/5">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2 opacity-40">
          <span className="w-1 h-5 bg-white/10 rounded-full" />
          User Reviews
        </h2>
        <div className="py-12 flex flex-col items-center justify-center gap-3 rounded-3xl bg-white/[0.02] border border-dashed border-white/5">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <User className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-xs font-bold text-white/20 uppercase tracking-widest">No reviews yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6 pt-8 border-t border-white/5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
          <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          User Reviews
          <span className="text-xs font-medium text-muted-foreground ml-2 bg-white/5 px-2 py-0.5 rounded-full">
            {data.total_results}
          </span>
        </h2>

        {data.total_pages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white/60">{page} / {data.total_pages}</span>
            <button 
              disabled={page === data.total_pages}
              onClick={() => setPage(p => p + 1)}
              className="p-1 rounded-lg hover:bg-white/5 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {data.results.map((review) => (
          <div key={review.id} className="glass-card rounded-2xl p-6 border border-white/5 space-y-4 hover:border-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                  {review.author_details.avatar_path ? (
                    <img 
                      src={getTmdbImageUrl(review.author_details.avatar_path, 'w45')} 
                      alt={review.author}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-brand-primary" />
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
                <div className="flex items-center gap-1.5 bg-brand-primary/10 border border-brand-primary/20 px-2 py-1 rounded-lg shrink-0">
                  <Star className="w-3 h-3 text-brand-primary fill-brand-primary" />
                  <span className="text-[11px] font-black text-brand-primary">{review.author_details.rating}</span>
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
            </a>
          </div>
        ))}
      </div>
    </section>
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

export default MediaReviews;
