import { useNavigate } from 'react-router-dom';
import { 
  useGetTrendingQuery, 
  useGetPopularMoviesQuery, 
  useGetTopRatedMoviesQuery, 
  useGetUpcomingMoviesQuery,
  useGetTopRatedTVQuery,
  useGetPopularPeopleQuery
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
  Users
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
    </div>
  );
};

export default HomeFeatured;
