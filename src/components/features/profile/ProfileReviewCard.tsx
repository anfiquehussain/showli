import { useNavigate } from 'react-router-dom';
import { Star, Film, Tv } from 'lucide-react';
import { getTmdbImageUrl } from '@/utils/image';
import type { Comment } from '@/types/discussions.types';
import { useGetMovieDetailsQuery, useGetTVDetailsQuery } from '@/api/media/mediaApi';
import Skeleton from '@/components/ui/Skeleton';

interface ProfileReviewCardProps {
  review: Comment;
  onNavigate?: () => void;
  size?: 'sm' | 'md';
}

export const ProfileReviewCard = ({ review, onNavigate, size = 'sm' }: ProfileReviewCardProps) => {
  const navigate = useNavigate();

  // Conditionally query TMDb if mediaTitle or posterPath is missing
  const isMissingData = !review.mediaTitle || !review.posterPath;

  const movieQuery = useGetMovieDetailsQuery(review.mediaId, {
    skip: !isMissingData || review.mediaType !== 'movie',
  });

  const tvQuery = useGetTVDetailsQuery(review.mediaId, {
    skip: !isMissingData || review.mediaType !== 'tv',
  });

  const tmdbData = review.mediaType === 'movie' ? movieQuery.data : tvQuery.data;
  const isLoading = review.mediaType === 'movie' ? movieQuery.isLoading : tvQuery.isLoading;

  // Resolve title and poster
  const resolvedTitle = review.mediaTitle || (
    tmdbData
      ? ('title' in tmdbData ? tmdbData.title : tmdbData.name)
      : `${review.mediaType === 'movie' ? 'Movie' : 'TV Show'} #${review.mediaId}`
  );

  const resolvedPoster = review.posterPath || tmdbData?.poster_path || null;

  const handleMediaClick = () => {
    if (onNavigate) onNavigate();
    navigate(`/${review.mediaType}/${review.mediaId}`);
  };

  const isSmall = size === 'sm';

  return (
    <div
      className={`group flex gap-3.5 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-brand-accent/30 transition-standard`}
    >
      {/* Poster image / Fallback */}
      <div
        onClick={handleMediaClick}
        className={`${isSmall
            ? 'w-12 h-18 sm:w-14 sm:h-20'
            : 'w-14 h-20 sm:w-16 sm:h-24'
          } rounded-lg overflow-hidden bg-card border border-white/10 shrink-0 cursor-pointer shadow-md group-hover:scale-[1.02] transition-standard relative`}
      >
        {isLoading ? (
          <Skeleton className="w-full h-full bg-white/5" />
        ) : resolvedPoster ? (
          <img
            src={getTmdbImageUrl(resolvedPoster, 'w92')}
            alt={resolvedTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 text-muted-foreground/40 gap-0.5">
            {review.mediaType === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
            <span className="text-[6px] font-bold uppercase">No Poster</span>
          </div>
        )}
      </div>

      {/* Content details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-1.5">
            {isLoading ? (
              <Skeleton className="h-4 w-1/2 bg-white/5 mt-1" />
            ) : (
              <h4
                onClick={handleMediaClick}
                className={`font-bold ${isSmall ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-white hover:text-brand-accent transition-standard truncate cursor-pointer`}
              >
                {resolvedTitle}
              </h4>
            )}

            {/* Star Rating */}
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-warning/10 text-warning shrink-0">
              <Star className="w-2.5 h-2.5 fill-current" />
              <span className={`font-black ${isSmall ? 'text-[10px]' : 'text-xs'}`}>{review.rating}</span>
            </div>
          </div>

          <p className={`${isSmall ? 'text-[10px] sm:text-xs line-clamp-3' : 'text-xs sm:text-sm'} text-muted-foreground italic wrap-break-word font-medium leading-normal`}>
            "{review.content}"
          </p>
        </div>

        <div className="flex items-center justify-between text-[9px] text-white/30 font-bold uppercase tracking-wider mt-1.5">
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
};

export default ProfileReviewCard;
