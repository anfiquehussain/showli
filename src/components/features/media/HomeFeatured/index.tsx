import { useNavigate } from 'react-router-dom';
import { 
  useGetTrendingQuery, 
  useGetPopularMoviesQuery, 
  useGetTopRatedMoviesQuery, 
  useGetUpcomingMoviesQuery,
  useGetTopRatedTVQuery,
  useGetPopularPeopleQuery,
  useDiscoverQuery
} from '@/api/media/mediaApi';
import MediaScroll from '@/components/patterns/MediaScroll';
import PersonScroll from '@/components/patterns/PersonScroll';
import QuickBrowseHub from '../QuickBrowseHub';
import { 
  TrendingUp, 
  Flame, 
  Film, 
  Star, 
  Calendar, 
  Tv, 
  Users,
  Sparkles,
  Smile,
  Heart,
  History
} from 'lucide-react';
import HomeSearchBar from './HomeSearchBar';

export const HomeFeatured = () => {
  const navigate = useNavigate();

  const { data: trendingDay, isLoading: loadingDay } = useGetTrendingQuery({ type: 'all', timeWindow: 'day' });
  const { data: trendingWeek, isLoading: loadingWeek } = useGetTrendingQuery({ type: 'all', timeWindow: 'week' });
  const { data: popularMovies, isLoading: loadingPopMovies } = useGetPopularMoviesQuery();
  const { data: topRatedMovies, isLoading: loadingTopMovies } = useGetTopRatedMoviesQuery();
  const { data: upcomingMovies, isLoading: loadingUpcoming } = useGetUpcomingMoviesQuery();
  const { data: topRatedTV, isLoading: loadingTopTV } = useGetTopRatedTVQuery();
  const { data: popularPeople, isLoading: loadingPeople } = useGetPopularPeopleQuery({ page: 1 });
  
  const { data: popularAnime, isLoading: loadingAnime } = useDiscoverQuery({
    type: 'tv',
    params: {
      with_genres: 16,
      with_original_language: 'ja',
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const { data: popularMalayalam, isLoading: loadingMalayalam } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_original_language: 'ml',
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const { data: popularTamil, isLoading: loadingTamil } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_original_language: 'ta',
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const { data: matureContent, isLoading: loadingMature } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_genres: 10749,
      certification_country: 'US',
      certification: 'R',
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const { data: classics80s, isLoading: loadingClassics } = useDiscoverQuery({
    type: 'movie',
    params: {
      'primary_release_date.gte': '1980-01-01',
      'primary_release_date.lte': '1989-12-31',
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  const { data: funToWatch, isLoading: loadingFun } = useDiscoverQuery({
    type: 'movie',
    params: {
      with_genres: '35|12|10751',
      sort_by: 'popularity.desc',
      page: 1,
    },
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Mini Search Bar with Suggestions */}
      <HomeSearchBar />

      <MediaScroll 
        title="Trending Today" 
        icon={<TrendingUp className="w-4 h-4" />} 
        items={trendingDay?.results || []} 
        isLoading={loadingDay}
        onViewAll={() => navigate('/browse?sort_by=trending.day')}
      />

      <MediaScroll 
        title="Top of the Week" 
        icon={<Flame className="w-4 h-4" />} 
        items={trendingWeek?.results || []} 
        isLoading={loadingWeek}
        onViewAll={() => navigate('/browse?sort_by=trending.week')}
      />

      <QuickBrowseHub />

      <PersonScroll 
        title="Popular People" 
        icon={<Users className="w-4 h-4" />} 
        items={popularPeople?.results || []} 
        isLoading={loadingPeople}
      />

      <MediaScroll 
        title="Popular Movies" 
        icon={<Film className="w-4 h-4" />} 
        items={popularMovies?.results || []} 
        isLoading={loadingPopMovies}
        onViewAll={() => navigate('/browse?type=movie&sort_by=popularity.desc')}
      />

      <MediaScroll 
        title="All-Time Best" 
        icon={<Star className="w-4 h-4" />} 
        items={topRatedMovies?.results || []} 
        isLoading={loadingTopMovies}
        onViewAll={() => navigate('/browse?type=movie&sort_by=vote_average.desc')}
      />

      <MediaScroll 
        title="Upcoming Releases" 
        icon={<Calendar className="w-4 h-4" />} 
        items={upcomingMovies?.results || []} 
        isLoading={loadingUpcoming}
        onViewAll={() => navigate('/browse?type=movie&status=upcoming')}
      />

      <MediaScroll 
        title="Top Rated Series" 
        icon={<Tv className="w-4 h-4" />} 
        items={topRatedTV?.results || []} 
        isLoading={loadingTopTV}
        onViewAll={() => navigate('/browse?type=tv&sort_by=vote_average.desc')}
      />

      <MediaScroll 
        title="Popular Anime" 
        icon={<Sparkles className="w-4 h-4 text-palette-pink" />} 
        items={popularAnime?.results || []} 
        isLoading={loadingAnime}
        onViewAll={() => navigate('/browse?genre=16&language=ja')}
      />

      <MediaScroll 
        title="Popular Malayalam" 
        icon={<Film className="w-4 h-4 text-palette-emerald" />} 
        items={popularMalayalam?.results || []} 
        isLoading={loadingMalayalam}
        onViewAll={() => navigate('/browse?language=ml')}
      />

      <MediaScroll 
        title="Popular Tamil" 
        icon={<Film className="w-4 h-4 text-palette-orange" />} 
        items={popularTamil?.results || []} 
        isLoading={loadingTamil}
        onViewAll={() => navigate('/browse?language=ta')}
      />

      <MediaScroll 
        title="Romantic Mature" 
        icon={<Heart className="w-4 h-4 text-palette-pink" />} 
        items={matureContent?.results || []} 
        isLoading={loadingMature}
        onViewAll={() => navigate('/browse?genre=10749&certification=R')}
      />

      <MediaScroll 
        title="80s Classics" 
        icon={<History className="w-4 h-4 text-palette-amber" />} 
        items={classics80s?.results || []} 
        isLoading={loadingClassics}
        onViewAll={() => navigate('/browse?year=1980')}
      />

      <MediaScroll 
        title="Fun to Watch" 
        icon={<Smile className="w-4 h-4 text-palette-yellow" />} 
        items={funToWatch?.results || []} 
        isLoading={loadingFun}
        onViewAll={() => navigate('/browse?genre=35')}
      />
    </div>
  );
};

export default HomeFeatured;
