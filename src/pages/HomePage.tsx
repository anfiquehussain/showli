import HeroCarousel from '@/components/features/movies/HeroCarousel';
import PageHeader from '@/components/patterns/PageHeader';
import DiscoveryGrids from '@/components/features/tv/DiscoveryGrids';

const HomePage = () => {
  return (
    <div className="space-y-12">
      {/* Hero Carousel Feature */}
      <HeroCarousel />

      <PageHeader 
        title="Discover" 
        description="Explore the latest in cinema, anime, and global television."
      >
        <DiscoveryGrids />
      </PageHeader>
    </div>
  );
};

export default HomePage;
