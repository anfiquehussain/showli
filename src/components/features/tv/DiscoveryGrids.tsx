import { Calendar, Film, Tv, Sparkles, Globe, Heart } from 'lucide-react';
import { 
  useGetAiringTodayQuery, 
  useGetPopularMoviesQuery, 
  useGetTopRatedTVQuery,
  useDiscoverQuery
} from '@/api/tmdb/tmdbApi';
import MediaScroll from '@/components/patterns/MediaScroll';

const DiscoveryGrids = () => {
  // 1. Airing Today (TV)
  const { data: airingData, isLoading: airingLoading } = useGetAiringTodayQuery();
  
  // 2. Popular Movies
  const { data: popularData, isLoading: popularLoading } = useGetPopularMoviesQuery();
  
  // 3. Anime (Animation genre: 16)
  const { data: animeData, isLoading: animeLoading } = useDiscoverQuery({
    type: 'tv',
    params: { with_genres: 16, sort_by: 'popularity.desc' }
  });

  // 4. Indian Cinema (Origin Country: IN)
  const { data: indianData, isLoading: indianLoading } = useDiscoverQuery({
    type: 'movie',
    params: { with_origin_country: 'IN', sort_by: 'popularity.desc' }
  });

  // 5. K-Drama (Language: ko, Type: TV)
  const { data: kdramaData, isLoading: kdramaLoading } = useDiscoverQuery({
    type: 'tv',
    params: { with_original_language: 'ko', sort_by: 'popularity.desc' }
  });

  // 6. Top Rated Series
  const { data: topTVData, isLoading: topTVLoading } = useGetTopRatedTVQuery();

  return (
    <div className="space-y-8">
      <MediaScroll 
        title="Airing Today" 
        icon={<Calendar className="w-4 h-4" />} 
        items={airingData?.results || []} 
        isLoading={airingLoading} 
      />

      <MediaScroll 
        title="Popular Movies" 
        icon={<Film className="w-4 h-4" />} 
        items={popularData?.results || []} 
        isLoading={popularLoading} 
      />

      <MediaScroll 
        title="Anime Universe" 
        icon={<Sparkles className="w-4 h-4" />} 
        items={animeData?.results || []} 
        isLoading={animeLoading} 
      />

      <MediaScroll 
        title="Indian Cinema" 
        icon={<Globe className="w-4 h-4" />} 
        items={indianData?.results || []} 
        isLoading={indianLoading} 
      />

      <MediaScroll 
        title="K-Drama Hits" 
        icon={<Heart className="w-4 h-4" />} 
        items={kdramaData?.results || []} 
        isLoading={kdramaLoading} 
      />

      <MediaScroll 
        title="Top Rated Series" 
        icon={<Tv className="w-4 h-4" />} 
        items={topTVData?.results || []} 
        isLoading={topTVLoading} 
      />
    </div>
  );
};

export default DiscoveryGrids;
