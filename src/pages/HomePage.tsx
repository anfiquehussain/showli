import HeroCarousel from '@/components/features/media/HeroCarousel';
import QuickBrowseEntry from '@/components/features/media/QuickBrowseEntry';
import PageHeader from '@/components/patterns/PageHeader';
import DiscoveryGrids from '@/components/features/media/DiscoveryGrids';

const HomePage = () => {
  return (
    <div className="space-y-6">
      {/* Hero Carousel Feature */}
      <HeroCarousel />

      <QuickBrowseEntry />

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
