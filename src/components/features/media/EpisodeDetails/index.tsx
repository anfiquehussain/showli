import { useGetTVEpisodeDetailsQuery, useGetTVDetailsQuery, useGetTVSeasonDetailsQuery } from '@/api/media/mediaApi';
import EpisodeHero from './EpisodeHero';
import EpisodeInfo from './EpisodeInfo';
import EpisodeCredits from './EpisodeCredits';
import EpisodeGallery from './EpisodeGallery';
import EpisodeNavigation from './EpisodeNavigation';
import Skeleton from '../../../ui/Skeleton';
import ScrollContainer from '@/components/patterns/ScrollContainer';
import { getTmdbImageUrl } from '@/utils/image';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface EpisodeDetailsProps {
  tvId: number;
  seasonNumber: number;
  episodeNumber: number;
}

const EpisodeDetails = ({ tvId, seasonNumber, episodeNumber }: EpisodeDetailsProps) => {
  // Fetch TV Show details for show name & seasons recommendations
  const { data: show, isLoading: isShowLoading, error: showError } = useGetTVDetailsQuery(tvId);

  // Fetch TV Season details for episodes list recommendations
  const { data: season, isLoading: isSeasonLoading } = useGetTVSeasonDetailsQuery({
    tvId,
    seasonNumber,
  });

  // Fetch detailed Episode details including credits, stills & videos
  const { data: episode, isLoading: isEpisodeLoading, error: episodeError } = useGetTVEpisodeDetailsQuery({
    tvId,
    seasonNumber,
    episodeNumber,
  });

  const isLoading = isEpisodeLoading || isShowLoading || isSeasonLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-64 sm:h-80 md:h-96 w-full rounded-3xl bg-white/5 border border-white/5" />
        
        {/* Info Blocks Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          <div className="h-48 w-full rounded-2xl bg-white/5 border border-white/5" />
        </div>

        {/* Cast Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 rounded-md" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="w-24 sm:w-28 shrink-0 space-y-3">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full" />
                <Skeleton className="h-4 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (episodeError || showError || !episode || !show) {
    return (
      <div className="text-center py-16 px-4 bg-white/3 border border-white/10 rounded-3xl">
        <h2 className="text-xl font-black text-white mb-2">Failed to load episode details</h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          We encountered an error loading this episode's details from TMDB. Please check your internet connection or try again.
        </p>
        <Link 
          to="/" 
          className="inline-flex py-2.5 px-6 rounded-xl bg-brand-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-accent transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // Filter out the current episode for "More from this Season"
  const otherEpisodes = (season?.episodes || []).filter((ep) => ep.episode_number !== episodeNumber);

  // Filter out current season for "Other Seasons"
  const otherSeasons = (show?.seasons || []).filter((s) => s.season_number !== seasonNumber);

  return (
    <div className="pb-12 space-y-8">
      {/* 1. HERO SECTION */}
      <EpisodeHero 
        episode={episode} 
        show={show} 
        tvId={tvId} 
      />

      {/* 2. Content Sections (Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Story, Credits, Gallery, Navigation */}
        <div className="lg:col-span-8 space-y-8">
          {/* Storyline Overview */}
          <section className="space-y-3">
            <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              Storyline
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium max-w-2xl text-pretty whitespace-pre-line">
              {episode.overview || "No overview available for this episode. Stay tuned!"}
            </p>
          </section>

          {/* Cast, Crew & Guest Stars */}
          <EpisodeCredits 
            cast={episode.credits?.cast} 
            crew={episode.credits?.crew} 
            guestStars={episode.credits?.guest_stars} 
          />

          {/* Media Gallery Stills */}
          {episode.images?.stills && episode.images.stills.length > 0 && (
            <EpisodeGallery images={episode.images.stills} />
          )}

          {/* Navigation (Prev / Next) */}
          <EpisodeNavigation 
            tvId={tvId} 
            seasonNumber={seasonNumber} 
            episodeNumber={episodeNumber} 
          />
        </div>

        {/* Right Column: Sticky Quick Facts */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <EpisodeInfo episode={episode} />
          </div>
        </aside>
      </div>

      {/* 6. RECOMMENDATIONS */}
      {/* 6.1 More Episodes from the Same Season */}
      {otherEpisodes.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-white/5">
          <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            More From Season {seasonNumber}
          </h2>

          <ScrollContainer className="gap-4 pb-4" size="sm">
            {otherEpisodes.map((ep) => (
              <Link
                key={ep.id}
                to={`/tv/${tvId}/season/${seasonNumber}/episode/${ep.episode_number}`}
                className="group w-48 sm:w-56 shrink-0 flex flex-col bg-white/3 border border-white/10 hover:border-brand-primary/40 rounded-2xl overflow-hidden transition-colors duration-300 transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-video bg-white/5 border-b border-white/5 overflow-hidden">
                  {ep.still_path ? (
                    <img
                      src={getTmdbImageUrl(ep.still_path, 'w300')}
                      alt={ep.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-md border border-white/10">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider">
                      Ep {ep.episode_number}
                    </span>
                  </div>
                </div>
                <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                    {ep.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      {ep.air_date ? new Date(ep.air_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-warning text-warning" />
                      <span className="text-[9px] text-warning font-black">{ep.vote_average?.toFixed(1) || '0.0'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </ScrollContainer>
        </section>
      )}

      {/* 6.2 Other Seasons of the Show */}
      {otherSeasons.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-white/5">
          <h2 className="text-lg md:text-xl font-heading font-bold text-white flex items-center gap-2">
            <span className="w-1 h-5 bg-brand-primary rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            Other Seasons of {show.name}
          </h2>

          <ScrollContainer className="gap-4 pb-4" size="sm">
            {otherSeasons.map((s) => (
              <Link
                key={s.id}
                to={`/tv/${tvId}?season=${s.season_number}#seasons-section`}
                className="group w-32 sm:w-40 shrink-0 flex flex-col bg-white/3 border border-white/10 hover:border-brand-primary/40 rounded-2xl overflow-hidden transition-colors duration-300 transform hover:-translate-y-0.5"
              >
                <div className="relative aspect-2/3 bg-white/5 border-b border-white/5 overflow-hidden">
                  {s.poster_path ? (
                    <img
                      src={getTmdbImageUrl(s.poster_path, 'w300')}
                      alt={s.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground uppercase font-black tracking-wider">
                      No Poster
                    </div>
                  )}
                </div>
                <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-brand-primary transition-colors truncate">
                    {s.name}
                  </h4>
                  <span className="text-[9px] text-muted-foreground font-semibold mt-1">
                    {s.episode_count} Episodes
                  </span>
                </div>
              </Link>
            ))}
          </ScrollContainer>
        </section>
      )}
    </div>
  );
};

export default EpisodeDetails;
