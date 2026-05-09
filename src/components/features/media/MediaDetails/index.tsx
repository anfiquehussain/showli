import { useState } from 'react';
import { useGetMovieDetailsQuery, useGetTVDetailsQuery } from '@/api/media/mediaApi';
import AddToCollectionModal from '@/components/features/collections/AddToCollectionModal/index';
import type { TmdbMovieDetails, TmdbTVDetails } from '@/types/tmdb.types';

// Internal Components
import MediaHero from './MediaHero';
import MediaQuickFacts from './MediaQuickFacts';
import MediaReviews from './MediaReviews';
import MediaCast from './MediaCast';
import MediaCrew from './MediaCrew';
import MediaImages from './MediaImages';
import MediaVideos from './MediaVideos';
import MediaWatchProviders from './MediaWatchProviders';
import MediaRecommendations from './MediaRecommendations';
import MediaSimilar from './MediaSimilar';
import TVSeasons from './TVSeasons';
import FullCreditsModal from './FullCreditsModal';

interface MediaDetailsProps {
  id: number;
  type: 'movie' | 'tv';
}

const MediaDetails = ({ id, type }: MediaDetailsProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);

  const movieQuery = useGetMovieDetailsQuery(id, { skip: type !== 'movie' });
  const tvQuery = useGetTVDetailsQuery(id, { skip: type !== 'tv' });

  const { data: media, isLoading, isError } = type === 'movie' ? movieQuery : tvQuery;

  if (isLoading) {
    return (
      <div className="w-full h-[60vh] bg-card/50 animate-pulse rounded-3xl" />
    );
  }

  if (isError || !media) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-error">Failed to load details.</h2>
      </div>
    );
  }

  const title = 'title' in media ? media.title : media.name;
  const date = 'release_date' in media ? media.release_date : media.first_air_date;
  const year = date?.split('-')[0];
  const tagline = media.tagline;

  const runtime = type === 'movie'
    ? (media as TmdbMovieDetails).runtime
    : (media as TmdbTVDetails).episode_run_time?.[0] || null;


  return (
    <div className="pb-12 space-y-8">
      {/* 1. Immersive Hero Section */}
      <MediaHero
        media={media}
        type={type}
        title={title}
        year={year}
        runtime={runtime}
        tagline={tagline}
        onAddToCollection={() => setIsAddModalOpen(true)}
      />

      {/* 2. Content Sections */}
      <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Story & Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Overview */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Storyline
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium max-w-2xl">
              {media.overview || "No overview available for this title."}
            </p>
          </section>

          {/* TV Seasons & Episodes */}
          {type === 'tv' && (media as TmdbTVDetails).seasons && (
            <TVSeasons
              tvId={id}
              seasons={(media as TmdbTVDetails).seasons}
            />
          )}

          {/* Top Cast */}
          <MediaCast
            id={id}
            type={type}
            onShowFullCredits={() => setIsCreditsModalOpen(true)}
          />

          {/* Top Crew */}
          <MediaCrew
            id={id}
            type={type}
            onShowFullCredits={() => setIsCreditsModalOpen(true)}
          />

          {/* Media Images Gallery */}
          <MediaImages id={id} type={type} />

          {/* Media Trailers & Clips */}
          <MediaVideos id={id} type={type} />

          {/* User Reviews */}
          <MediaReviews id={id} type={type} />
        </div>

        {/* Right Column: Quick Facts & Stats */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            <MediaWatchProviders id={id} type={type} />
            <MediaQuickFacts
              media={media}
              type={type}
            />
          </div>
        </aside>
      </div>

      {/* Discovery Sections */}
      <MediaRecommendations id={id} type={type} />
      <MediaSimilar id={id} type={type} />

      {media && (
        <AddToCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          media={media}
        />
      )}

      <FullCreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        id={id}
        type={type}
        title={title}
      />
    </div>
  );
};

export default MediaDetails;
